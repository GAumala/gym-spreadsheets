const boundary = require('./boundary.js');
const lib = require('./lib.js');
const { 
  numberToThousandthInt, 
  thousandthIntToNumber 
} = require('./lib/units.js');
const {
  getMonthShortName
} = require('./lib/dateFormatters.js');
const {
  convertDateToSlot,
  createMonthSlots,
  createFutureSlotsAtHour,
  breakTimeSlotsWithDate 
} = require('./lib/timeSlot.js');
const {
  moveDateArrayToFutureTime,
  moveDateArrayToMinuteEarlier,
  moveDateArrayToNextMonthStart,
  moveDateArrayToNextTrainingHour,
} = require('./lib/dateArray.js');
const calendar = require('./lib/calendar.js');
const { createChallengeDBRows } = require('./db/tableHelpers.js');
const { FatalError } = require('./errors.js');

const getDateArrayBeforeDayNumber = (clock, dayNumber) => {
  const todayDateArray = clock.getFullDateArray();
  const nextMonthDateArray = moveDateArrayToNextMonthStart(todayDateArray);
  const todayNumber = todayDateArray[2];
  return dayNumber < todayNumber 
    ? nextMonthDateArray 
    : todayDateArray;  
}

const populateMemberTable = async (admin) =>  {
  const loadRes = await admin.sheetsAPI.loadMembers();
  await admin.db.setMemberRows(loadRes.data);
  return loadRes;
};

const populateReservationTable = async (admin, dateArray) => {
  const { sheetsAPI, db } = admin;
  const [ year, month ] = dateArray;

  const sheetTitle = lib.getTimetableSheetName(year, month);
  const loadRes = await sheetsAPI.loadTimeSlots(sheetTitle);
  if (loadRes.timeTableMissing)
    return { ...loadRes, sheetTitle };
  
  // only future rows should be used
  const { past, future } = breakTimeSlotsWithDate(loadRes.data, dateArray);
  await db.setReservationRows(future);

  return { 
    ...loadRes,
    data: future,
    sheetTitle,
    reconciliateFn: (newData) => 
      loadRes.reconciliateFn(past.concat(newData))
  };
};

const updateTimeTableWithNewMember = async (admin, {dateArray, newMember}) => {
  const { 
    timeTableMissing, 
    data: timeTableData,
    reconciliateFn: reconciliateTimeSlots
  } = await populateReservationTable(admin, dateArray);

  if (timeTableMissing)
    return []; 

  const newSlots = createFutureSlotsAtHour(dateArray, newMember.entrada);
  const { newData, unavailableDays } = 
    await admin.db.updateReservationsWithNewMember(newMember, newSlots);

  await reconciliateTimeSlots(newData);
  return unavailableDays;
};


class SheetsAdmin {
  constructor({ sheetsAPI, clock, db }) {
    this.sheetsAPI = sheetsAPI;
    this.clock = clock;
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

    return membersSheet.reconciliateFn(updated);
  }

  /**
   * Revisa el spreadsheet de los con las mediciones del challenge y compara
   * los valores del primer sheet con el segundo. Se asume que el primer sheet
   * tiene los valores iniciales y la segunda los finales. Devuelve los primeros 
   * tres miembros con mayor diferencia en el challenge.
   */
  async pickChallengeWinners() {
    const { sheetsAPI, db } = this;
    const { data: memberData } = await this.populateMemberTable();

    const { startData, endData } = await sheetsAPI.loadChallengeContestants();

    const challengeColumn = 'peso';
    const startRows = createChallengeDBRows(challengeColumn, startData);
    const endRows = createChallengeDBRows(challengeColumn, endData);

    return (await db.pickChallengeWinners(startRows, endRows))
      .map(row => ({ 
        nombre: row.nombre,
        start: thousandthIntToNumber(row.start),
        end: thousandthIntToNumber(row.end),
        diff: thousandthIntToNumber(row.diff)})
      );
  }

  /**
   * Crea una nueva worksheet con el horario establecido para los miembros actuales
   * en el spreadsheet de miembros. Si este worksheet ya existe se lanza un error
   * fatal.
   */
  async createTimeTableSheet(args) {
    const { sheetsAPI, db, clock } = this;
    const { data: memberData } = await populateMemberTable(this);

    const excessHours = await db.checkExcessMembersInTimeSlot();
    if (excessHours.length > 0) 
      throw new FatalError('EXCESS_HOURS', { excessHours })

    const [year, month] = args.currentMonth 
      ? clock.getYearAndMonth() 
      : clock.getNextYearAndMonth();

    const sheetName = lib.getTimetableSheetName(year, month);
    const { reconciliateFn } = await sheetsAPI.createTimeTableSheet(sheetName);

    const slots = createMonthSlots(year, month);
    const reservations = await db.createMonthReservations(slots);
    await reconciliateFn(reservations);
  }


  /**
   * Agrega una nueva fila al spreadsheet de miembro. 
   * Adicionalmente actualiza los spreadsheets de reservaciones de este mes y 
   * el siguiente (si existen) basado en el horario de entrada de este nuevo 
   * miembro.
   */
  async addNewMember(args) {
    const { sheetsAPI, db, clock } = this;
    const { data: newMemberData } = boundary.getNewMemberFromUserInput(args);
    const newMember = { 
      ...newMemberData, 
      id: lib.createUserID(newMemberData.nombre),
      email: '',
      lesiones: ''
    };

    const { 
      data: memberData, 
      reconciliateFn: reconciliateMembers 
    } = await populateMemberTable(this);

    await db.insertNewMember(newMember)

    const dateArray = clock.getFullDateArray();
    const [year, month] = dateArray;
    const nextMonthDateArray = moveDateArrayToNextMonthStart(dateArray);

    await updateTimeTableWithNewMember(this, {newMember, dateArray});
    await updateTimeTableWithNewMember(this, {
      newMember,
      dateArray: nextMonthDateArray, 
     });
    
    await reconciliateMembers([...memberData, newMember]);
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
    const { sheetsAPI, db, clock } = this;
    const { data: newReservationData } = boundary.getNewReservationFromUserInput(args);

    await populateMemberTable(this);

    const dateArray = 
      getDateArrayBeforeDayNumber(clock, newReservationData.diaNumero);

    const { 
      timeTableMissing, 
      data: timeTableData,
      sheetTitle,
      reconciliateFn
    } = await populateReservationTable(this, dateArray);
    
    if (timeTableMissing)
      throw new FatalError('SHEET_NOT_FOUND', { title: sheetTitle })

    const [ year, month ] = dateArray;
    const newReservation = { 
      ...convertDateToSlot(year, month, newReservationData.diaNumero, 0, 0),
      hora: newReservationData.hora,
      miembro: newReservationData.miembro
    }

    const newTimeTableData = 
      await db.changeReservationHourForADay(newReservation);
    await reconciliateFn(newTimeTableData);
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
    const { sheetsAPI, db, clock } = this;
    const { data: timeData } = boundary.getTimeFromUserInput(args);
    const dateArray = 
      moveDateArrayToNextTrainingHour(
        moveDateArrayToFutureTime(
          clock.getFullDateArray(), timeData));
    const slot = convertDateToSlot(...dateArray); 

    await populateMemberTable(this);
    const { 
      timeTableMissing, 
      data: timeTableData,
      sheetTitle,
      reconciliateFn
    } = await populateReservationTable(
      this, moveDateArrayToMinuteEarlier(dateArray));
    
    if (timeTableMissing)
      throw new FatalError('SHEET_NOT_FOUND', { title: sheetTitle })

    return await db.getReservationsAtSlot(slot)
  }
}

module.exports = SheetsAdmin;
