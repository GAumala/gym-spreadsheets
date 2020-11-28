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
  createMonthSlots,
  createFutureSlotsAtHour,
  breakTimeSlotsWithDate 
} = require('./lib/timeSlot.js');
const calendar = require('./lib/calendar.js');
const { createChallengeDBRows } = require('./db/tableHelpers.js');
const { FatalError } = require('./errors.js');

class SheetsAdmin {
  constructor({ sheetsAPI, clock, db }) {
    this.sheetsAPI = sheetsAPI;
    this.clock = clock;
    this.db = db;
  }

  async populateMemberTable() {
    const loadRes = await this.sheetsAPI.loadMembers();
    await this.db.setMemberRows(loadRes.data);
    return loadRes;
  }
  
  async populateReservationTable(sheetTitle, dateArray) {
    const loadRes = await this.sheetsAPI.loadTimeSlots(sheetTitle);
    if (loadRes.timeTableMissing)
      return loadRes;
    
    // only future rows should be used
    const { past, future } = breakTimeSlotsWithDate(loadRes.data, dateArray);
    await this.db.setReservationRows(future);

    return { 
      ...loadRes,
      data: future,
      reconciliateFn: (newData) => 
        loadRes.reconciliateFn(past.concat(newData))
    };
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
    const { data: memberData } = await this.populateMemberTable(deps);

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

  async updateTimeTableWithNewMember ({dateArray, newMember}) {
    const [year, month] = dateArray;
    const sheetName = lib.getTimetableSheetName(year, month);

    const { 
      timeTableMissing, 
      data: timeTableData,
      reconciliateFn: reconciliateTimeSlots
    } = await this.populateReservationTable(sheetName, dateArray);

    if (timeTableMissing)
      return []; 

    const newSlots = createFutureSlotsAtHour(dateArray, newMember.entrada);
    const { newData, unavailableDays } = 
      await this.db.updateReservationsWithNewMember(newMember, newSlots);

    await reconciliateTimeSlots(newData);
    return unavailableDays;
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
    } = await this.populateMemberTable();

    await db.insertNewMember(newMember)

    const dateArray = clock.getFullDateArray();
    const [year, month] = dateArray;
    const nextMonthDateArray = 
      [...calendar.getNextMonth(year, month), 1, 0, 0];

    await this.updateTimeTableWithNewMember({newMember, dateArray});
    await this.updateTimeTableWithNewMember({
      newMember,
      dateArray: nextMonthDateArray, 
     });
    
    await reconciliateMembers([...memberData, newMember]);
  }
}

module.exports = SheetsAdmin;
