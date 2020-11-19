const lib = require('./lib.js');
const { 
  numberToThousandthInt, 
  thousandthIntToNumber 
} = require('./lib/units.js');
const {
  getMonthShortName
} = require('./lib/dateFormatters.js');
const calendar = require('./lib/calendar.js');
const { createChallengeDBRows } = require('./db/tableHelpers.js');
const queries = require('./db/queries.js');
const { FatalError } = require('./errors.js');


/**
 * Revisa el spreadsheet de los miembros y actualiza las generando un id a las 
 * filas que no contengan uno.
 *
 * deps:
 * - loadMemberIDs: funcion para cargar las filas de miembros desde el 
 *   spreadsheet (sheet.js). debe de contener un array de los miembros 
 *   sanitizados en 'data' y la funcion 'reconciliateFn' para hacer 
 *   el update.  */
const setMissingUserIDs = async (deps) => { const membersSheet = await deps.loadMemberIDs();

  const original = membersSheet.data;
  const updated = lib.setMissingUserIDs(original);

  return membersSheet.reconciliateFn(updated);
}
/**
 * Revisa el spreadsheet de los con las mediciones del challenge y compara
 * los valores del primer sheet con el segundo. Se asume que el primer sheet
 * tiene los valores iniciales y la segunda los finales. Devuelve los primeros 
 * tres miembros con mayor diferencia en el challenge.
 *
 * deps:
 * - loadMember: funcion para cargar las filas de miembros desde el 
 *   spreadsheet (sheet.js). debe de contener un array de los miembros 
 *   sanitizados en 'data' .
 * - pickChallengeWinners: funcion para cargar las filas de mediciones de cada 
 *   hoja del spreadsheet (sheet.js). Debe de contener dos arrays con las 
 *   mediciones iniciales y finales.
 */
const pickChallengeWinners = async (deps) => {
  const { data: memberData } = await deps.loadMembers();
  await queries.setMemberRows(memberData);

  const { startData, endData } = await deps.loadChallengeContestants();

  const challengeColumn = 'peso';
  const startRows = createChallengeDBRows(challengeColumn, startData);
  const endRows = createChallengeDBRows(challengeColumn, endData);

  return (await queries.pickChallengeWinners(startRows, endRows))
    .map(row => ({ 
      nombre: row.nombre,
      start: thousandthIntToNumber(row.start),
      end: thousandthIntToNumber(row.end),
      diff: thousandthIntToNumber(row.diff)})
    );
};

/**
 * Crea una nueva worksheet con el horario establecido para los miembros actuales
 * en el spreadsheet de miembros. Si este worksheet ya existe se lanza un error
 * fatal.
 *
 * deps:
 * - loadMembers: funcion para cargar las filas de miembros desde el 
 *   spreadsheet (sheet.js). debe de contener un array de los miembros 
 * - createTimeTableSheet: funcion para crear la nueva worksheet en el spreadsheet de horarios. (sheet.js)
 *   sanitizados en 'data' .
 * - getYearAndNextMonth: funcion para obtener el año y mes en un array
 *   para el cual se generará el horario. Debería ser el mes siguiente al actual. (dateHelpers.js)
 */
const createTimeTableSheet = async (deps) => {
  const { data: memberData } = await deps.loadMembers();
  await queries.setMemberRows(memberData);

  const excessHours = await queries.checkExcessMembersInTimeSlot();
  if (excessHours.length > 0) 
    throw new FatalError('EXCESS_HOURS', { excessHours })

  const [year, month] = deps.getYearAndNextMonth();
  const sheetName = `${getMonthShortName(month)}-${year}`.toUpperCase();
  const { reconciliateFn } = await deps.createTimeTableSheet(sheetName);

  const slots = lib.createMonthSlots(year, month);
  const reservations = await queries.createMonthReservations(slots);
  await reconciliateFn(reservations);
}

module.exports = { 
  createTimeTableSheet,
  setMissingUserIDs,
  pickChallengeWinners 
};
