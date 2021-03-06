const boundary = require("./boundary.js");
const { compose, identity, withValue } = require("./lib/fp.js");
const lib = require("./lib.js");
const getMessage = require("./messages.js");
const {
  breakTimeSlotsWithDate,
  convertDateToSlot,
  createMonthSlots,
  createFutureSlotsAtHour,
  formatDayForTimeSlot,
} = require("./lib/timeSlot.js");
const {
  changeDateArrayHourAndMinutes,
  dateArrayToReadableString,
  moveDateArrayToFutureDay,
  moveDateArrayToNextMonthStart,
  moveDateArrayToNextTrainingHour,
  moveDateArrayToTodaysDawn,
} = require("./lib/dateArray.js");
const calendar = require("./lib/calendar.js");
const { FatalError } = require("./errors.js");

const getDateArrayBeforeDayNumber = (clock, dayNumber) => {
  const todayDateArray = clock.getFullDateArray();
  const nextMonthDateArray = moveDateArrayToNextMonthStart(todayDateArray);
  const todayNumber = todayDateArray[2];
  return dayNumber < todayNumber ? nextMonthDateArray : todayDateArray;
};

const populateMemberTable = async (admin) => {
  const loadRes = await admin.reporter
    .report("Cargando miembros")
    .whileDoing(admin.sheetsAPI.loadMembers());

  await admin.db.setMemberRows(loadRes.data);

  return loadRes;
};

const cleanReservationTable = async (admin, dateArray, memberIDsMap) => {
  const { reporter, sheetsAPI } = admin;
  const [year, month, day] = dateArray;
  const today = formatDayForTimeSlot(year, month, day);

  const sheetTitle = lib.getTimetableSheetName(year, month);

  const { data, timeTableMissing, reconciliateFn } = await reporter
    .report(`Cargando reservaciones ${sheetTitle}`)
    .whileDoing(sheetsAPI.loadReservations(sheetTitle));

  if (timeTableMissing) return 0;

  // 1st filter keeps only rows from today onwards
  // 2nd filter keeps only rows with known members
  const cleanRows = data
    .filter((reservation) => reservation.dia >= today)
    .filter((reservation) => !!memberIDsMap[reservation.miembro]);

  const totalCleaned = data.length - cleanRows.length;
  if (totalCleaned === 0) return 0;

  await reporter
    .report(`Actualizando reservaciones ${sheetTitle}`)
    .whileDoing(reconciliateFn(cleanRows));

  return totalCleaned;
};

const populateReservationTable = async (admin, dateArray, useAll) => {
  const { reporter, sheetsAPI, db } = admin;
  const [year, month] = dateArray;

  const sheetTitle = lib.getTimetableSheetName(year, month);

  const loadRes = await reporter
    .report(`Cargando reservaciones ${sheetTitle}`)
    .whileDoing(sheetsAPI.loadReservations(sheetTitle));

  if (loadRes.timeTableMissing) return { ...loadRes, sheetTitle };

  if (useAll) {
    await db.setReservationRows(loadRes.data);
    return {
      ...loadRes,
      reconciliateFn: async (newData) =>
        reporter
          .report(`Actualizando reservaciones ${sheetTitle}`)
          .whileDoing(loadRes.reconciliateFn(newData)),
    };
  }

  // only future rows should be used
  const { past, future } = breakTimeSlotsWithDate(loadRes.data, dateArray);
  await db.setReservationRows(future);

  return {
    ...loadRes,
    data: future,
    sheetTitle,
    reconciliateFn: (newData) =>
      reporter
        .report(`Actualizando reservaciones ${sheetTitle}`)
        .whileDoing(loadRes.reconciliateFn(past.concat(newData))),
  };
};

const updateTimeTableWithNewMember = async (admin, dateArray, newMember) => {
  const {
    timeTableMissing,
    reconciliateFn: reconciliateTimeSlots,
  } = await populateReservationTable(admin, dateArray);

  if (timeTableMissing) return [];

  const newSlots = createFutureSlotsAtHour(dateArray, newMember.entrada);
  if (newSlots.length === 0) return [];

  const {
    newData,
    unavailableDays,
  } = await admin.db.updateReservationsWithNewMember(newMember, newSlots);

  await reconciliateTimeSlots(newData);
  return unavailableDays;
};

const removeMemberFromTimeTable = async (admin, dateArray, id) => {
  const { timeTableMissing, reconciliateFn } = await populateReservationTable(
    admin,
    dateArray,
    true
  );

  if (timeTableMissing) return;

  const rows = await admin.db.deleteAllMemberReservations(id);
  return reconciliateFn(rows);
};

const rearrangeTimeTable = async (admin, dateArray, rearrangements) => {
  if (rearrangements.daysToRearrange.length === 0)
    return {
      commitChanges: () => Promise.resolve(),
      rearrangedSlots: [],
    };

  const { timeTableMissing, reconciliateFn } = await populateReservationTable(
    admin,
    dateArray
  );

  if (timeTableMissing)
    // no sheet to update
    return {
      commitChanges: () => Promise.resolve(),
      rearrangedSlots: rearrangements.daysToRearrange.map((dia) => ({
        dia,
        noTimeTable: true,
      })),
    };

  const { rows, rearrangedSlots } = await admin.db.rearrangeReservationRows(
    rearrangements
  );
  return {
    rearrangedSlots,
    commitChanges: () => reconciliateFn(rows),
  };
};

class SheetsAdmin {
  constructor({ sheetsAPI, clock, db, cache, reporter }) {
    this.sheetsAPI = sheetsAPI;
    this.reporter = reporter;
    this.clock = clock;
    this.cache = cache;
    this.db = db;
  }

  /**
   * Revisa el spreadsheet de los miembros y actualiza las generando un id a las
   * filas que no contengan uno.
   */
  async setMissingUserIDs() {
    const membersSheet = await this.sheetsAPI.loadMemberIDs();

    const original = membersSheet.data;
    const updated = lib.setMissingUserIDs(original);

    await membersSheet.reconciliateFn(updated);
    return {};
  }

  /**
   * Crea una nueva worksheet con el horario establecido para los miembros actuales
   * en el spreadsheet de miembros. Si este worksheet ya existe se lanza un error
   * fatal.
   */
  async createTimeTableSheet(args) {
    const { reporter, sheetsAPI, db, clock } = this;
    await populateMemberTable(this);

    const dateArray = clock.getFullDateArray();
    const [year, month] = args["this-month"]
      ? dateArray
      : calendar.getNextMonth(...dateArray);

    const sheetName = lib.getTimetableSheetName(year, month);
    const { reconciliateFn } = await reporter
      .report(`Creando nueva hoja de reservaciones ${sheetName}`)
      .whileDoing(sheetsAPI.createTimeTableSheet(sheetName));

    const slots = createMonthSlots(year, month);
    const reservations = await db.createMonthReservations(slots);
    await reporter
      .report(`Llenando hoja de reservaciones ${sheetName}`)
      .whileDoing(reconciliateFn(reservations));
    return {};
  }

  /**
   * Agrega una nueva fila al spreadsheet de miembro.
   * Adicionalmente actualiza los spreadsheets de reservaciones de este mes y
   * el siguiente (si existen) basado en el horario de entrada de este nuevo
   * miembro.
   */
  async addNewMember(args) {
    const { db, clock } = this;
    const { data: newMemberData } = boundary.getNewMemberFromUserInput(args);
    const newMember = {
      nombre: newMemberData.name,
      entrada: newMemberData.hour,
      id: newMemberData.id || lib.createUserID(newMemberData.name),
      email: "",
      notas: "",
    };

    const {
      data: memberData,
      reconciliateFn: reconciliateMembers,
    } = await populateMemberTable(this);

    await db.insertNewMember(newMember);

    const dateArray = clock.getFullDateArray();
    const nextMonthDateArray = moveDateArrayToNextMonthStart(dateArray);

    await updateTimeTableWithNewMember(this, dateArray, newMember);
    await updateTimeTableWithNewMember(this, nextMonthDateArray, newMember);

    await reconciliateMembers([...memberData, newMember]);
    return {};
  }

  /**
   * Agrega una reservacion en el horario especificado para el miembro
   * especificado. Cualquier otra reservación del mismo miembro en el mismo
   * día es eliminada.
   *
   * La hoja de reservaciones modificada depende de la fecha en la que se
   * ejecuta esta función y y el numero del dia de la nueva reservación.
   * Si el dia de la reservacion es mayor que el dia especificado, se usa
   * la hoja del mes actual. De lo contrario se usa la hoja del mes siguiente.
   *
   * Arroja error si la hoja a modificar no existe.
   * Arroja error si el número de reservaciones en el horario especificado
   * ya esta al límite.
   * Arroja error si la reservación especificada ya existe.
   */
  async changeReservationHourForADay(args) {
    const { db, clock } = this;
    const {
      data: newReservationData,
    } = boundary.getNewReservationFromUserInput(args);

    await populateMemberTable(this);

    const dateArray = getDateArrayBeforeDayNumber(
      clock,
      newReservationData.day
    );

    const {
      timeTableMissing,
      sheetTitle,
      reconciliateFn,
    } = await populateReservationTable(this, dateArray);

    if (timeTableMissing)
      throw new FatalError("SHEET_NOT_FOUND", { title: sheetTitle });

    const [year, month] = dateArray;
    const newReservation = {
      ...convertDateToSlot(year, month, newReservationData.day, 0, 0),
      hora: newReservationData.hour,
      miembro: newReservationData.member,
    };

    const newTimeTableData = await db.changeReservationHourForADay(
      newReservation
    );
    await reconciliateFn(newTimeTableData);
    return {};
  }

  /**
   * Muestra una lista de los miembros que han reservado a una hora
   * especificada.
   * Si no se agregan parametros se usa la siguiente hora en relación
   * al tiempo actual.
   * Si Solo se especifica la hora, pero no el día, se usa el día
   * actual.
   */
  async listMembersThatReservedAtTime(args) {
    const { db, clock } = this;
    const { data: timeData } = boundary.getTimeFromUserInput(args);

    await populateMemberTable(this);

    const modifyDay = timeData.day
      ? (x) => moveDateArrayToFutureDay(x, timeData.day)
      : identity;
    const modifyHour = timeData.hour
      ? (x) => changeDateArrayHourAndMinutes(x, timeData.hour)
      : identity;

    const dateArray = compose(
      moveDateArrayToNextTrainingHour,
      modifyDay,
      modifyHour,
      clock.getFullDateArray()
    );

    // Populate reservations table with data starting from today onwards.
    const { timeTableMissing, sheetTitle } = await populateReservationTable(
      this,
      dateArray
    );

    if (timeTableMissing)
      throw new FatalError("SHEET_NOT_FOUND", { title: sheetTitle });

    const readableDate = dateArrayToReadableString(dateArray);
    const slot = convertDateToSlot(...dateArray);
    const reservations = await db.getReservationsAtSlot(slot);
    const members = reservations.map(({ nombre }) => nombre);
    const message =
      reservations.length === 0
        ? getMessage("NO_RESERVATIONS", { date: readableDate })
        : getMessage("LIST_RESERVATIONS", { date: readableDate, members });

    return {
      message,
      data: reservations,
    };
  }

  /**
   * Remueve un miembro y todas sus ocurrencias de todos los spreadsheets.
   */
  async removeMember(args) {
    const { clock } = this;
    const { data: memberData } = boundary.getMemberIDStringFromUserInput(args);

    const {
      data: members,
      reconciliateFn: reconciliateMembers,
    } = await populateMemberTable(this);

    const targetID = memberData.id;
    const targetMemberIndex = members.findIndex((m) => m.id === targetID);
    if (targetMemberIndex === -1)
      throw new FatalError("MEMBER_NOT_FOUND", { id: targetID });

    const dateArray = clock.getFullDateArray();
    const nextMonthDateArray = moveDateArrayToNextMonthStart(dateArray);

    await removeMemberFromTimeTable(this, dateArray, targetID);
    await removeMemberFromTimeTable(this, nextMonthDateArray, targetID);

    const newMembers = members.filter((m, index) => index != targetMemberIndex);
    await reconciliateMembers(newMembers);

    return {};
  }

  async rearrangeReservations(args) {
    const { db, clock } = this;
    const { data: changesData } = boundary.getReservationChangesFromUserInput(
      args
    );

    const dateArrays = withValue(clock.getFullDateArray(), (v) => ({
      today: moveDateArrayToTodaysDawn(v),
      nextMonth: moveDateArrayToNextMonthStart(v),
    }));

    const rearrangements = lib.getRearrangementsByMonth(
      dateArrays.today,
      changesData
    );
    if (rearrangements.isEmpty)
      throw new FatalError("NO_RESERVATIONS_INPUT", {});

    await populateMemberTable(this);
    const memberRow = await db.findMiembroById(changesData.member);
    if (!memberRow)
      throw new FatalError("MEMBER_NOT_FOUND", { id: changesData.member });

    const results = [
      await rearrangeTimeTable(
        this,
        dateArrays.today,
        rearrangements.thisMonth
      ),
      await rearrangeTimeTable(
        this,
        dateArrays.nextMonth,
        rearrangements.nextMonth
      ),
    ];

    const rearrangedSlots = results
      .map(({ rearrangedSlots }) => rearrangedSlots)
      .flat();

    // update spreadsheets sequentially
    await results[0].commitChanges(); // this month
    await results[1].commitChanges(); // next month

    const name = memberRow.nombre;
    return {
      data: rearrangedSlots,
      message: getMessage("LIST_REARRANGEMENTS", { rearrangedSlots, name }),
    };
  }

  async cleanReservations() {
    const { clock, db } = this;

    await populateMemberTable(this);
    const memberIDsMap = await db.getMembersByIDMap();

    const dateArrays = withValue(clock.getFullDateArray(), (v) => ({
      today: moveDateArrayToTodaysDawn(v),
      nextMonth: moveDateArrayToNextMonthStart(v),
    }));

    const totalCleaned = [
      await cleanReservationTable(this, dateArrays.today, memberIDsMap),
      await cleanReservationTable(this, dateArrays.nextMonth, memberIDsMap),
    ].reduce((sum, count) => sum + count, 0);

    return {
      data: totalCleaned,
      message: `Se limpiaron ${totalCleaned} filas`,
    };
  }
}

module.exports = SheetsAdmin;
