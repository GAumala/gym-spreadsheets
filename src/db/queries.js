const knex = require('../db.js')
const { trainingHours } = require('../lib/constants.js');
const { FatalError } = require('../errors.js');
const SLOT_CAPACITY = 10;

const clear = (db = knex) => Promise.all([
  db('reservacion').truncate(), 
  db('challengeStart').truncate(), 
  db('challengeEnd').truncate(), 
  db('miembro').truncate()
]);

const clearMembers = (db = knex) => db('miembro').truncate();
const clearReservations = (db = knex) => db('reservacion').truncate();

const clearChallengeData = (db = knex) => Promise.all([
  db('challengeStart').truncate(), 
  db('challengeEnd').truncate() 
]);

const insertMiembro = (data, db = knex) => 
  db.table('miembro').insert(data);
const insertChallengeStart = (data, db = knex) => 
  db.table('challengeStart').insert(data);
const insertChallengeEnd = (data, db = knex) => 
  db.table('challengeEnd').insert(data);
const insertReservation = (data, db = knex) => {
  if (data.length < 330)
    return db.table('reservacion').insert(data);

  return db.batchInsert('reservacion', data, 330);
}
const deleteSpecificReservation = (reservacion, db = knex) =>
  db.from('reservacion')
    .where({ 
      miembro: reservacion.miembro,
      dia: reservacion.dia, 
      hora: reservacion.hora,  
    })
    .delete();

const getOrderedTimetable = (db = knex) =>
  db.from('reservacion')
    .select('*')
    .orderBy('dia', 'hora');

const findMiembroById = (id, db = knex) => db.select('*')
  .from('miembro').where({ id });

const findChallengeWinners = (db = knex) => 
  db.from('challengeStart')
    .select(knex.raw("nombre, challengeStart.medicion as `start`, challengeEnd.medicion as `end`, (challengeStart.medicion - challengeEnd.medicion) as `diff`"))
    .innerJoin('challengeEnd', 'challengeStart.miembro', 'challengeEnd.miembro')
    .innerJoin('miembro', 'challengeStart.miembro', 'miembro.id')
    .orderBy('diff', 'desc')
    .limit(3);

const pickChallengeWinners = (startRows, endRows) => 
  knex.transaction(async trx => {
    await clearChallengeData(trx);
    await insertChallengeStart(startRows, trx);
    await insertChallengeEnd(endRows, trx);
    return findChallengeWinners(trx);
  });

const setMemberRows = rows => 
  knex.transaction(async trx => {
    await clearMembers(trx);
    await insertMiembro(rows, trx);

    const violations = await checkMemberEntradaConstraint(trx);
  if (violations.length > 0) 
    throw new FatalError('EXCESS_MEMBERS_IN_HOUR', { violations });
  });

const setReservationRows = rows => 
  knex.transaction(async trx => {
    await clearReservations(trx);
    if (rows.length === 0)
      return;
    await insertReservation(rows, trx);

    const violations = await checkReservationSlotConstraint(trx);
  if (violations.length > 0) 
    throw new FatalError('EXCESS_RESERVATIONS_IN_SLOT', { violations });
  });

const getMemberIDsByTrainingHour = (entrada, db = knex, limit = SLOT_CAPACITY) => 
  db.from('miembro')
    .select('id')
    .where({ entrada })
    .limit(limit);

const createMembersByHourMap = async (db = knex) => {
  const membersByHour = {};
  for (let i = 0; i < trainingHours.length; i++) {
    const hour = trainingHours[i];
    const members = await getMemberIDsByTrainingHour(hour, db);
    membersByHour[hour] = members;
  }
  return membersByHour;
}

const checkMemberEntradaConstraint = (db = knex) => 
  db.from('miembro')
    .select(knex.raw('entrada, COUNT(id) as count'))
    .groupBy('entrada')
    .having('count', '>', SLOT_CAPACITY);

const checkReservationSlotConstraint = (db = knex) => 
  db.from('reservacion')
    .select(knex.raw('dia, hora, COUNT(miembro) as count'))
    .groupBy('dia', 'hora')
    .having('count', '>', SLOT_CAPACITY)

const findDaysWithHourFull = (hora, db = knex) => 
  db.from('reservacion')
    .select(knex.raw('dia, COUNT(miembro) as count'))
    .where({ hora })
    .groupBy('dia')
    .having('count', '>', SLOT_CAPACITY - 1)
    .then(rows => rows.map(({ dia }) => dia))

const findTempReservationtions = (dia, hora, limit, db = knex) => 
  db.from('reservacion')
    .select('miembro', 'dia', 'hora')
    .where({ dia, hora })
    .innerJoin('miembro', 'reservacion.miembro', 'miembro.id')
    .andWhere('miembro.entrada', '<>', 'reservacion.hora')
    .limit(limit)

const createMonthReservations = monthSlots => 
  knex.transaction(async trx => {
    await clearReservations(trx);

    const membersByHour = await createMembersByHourMap(trx); 
    return monthSlots.map(slot => 
      membersByHour[slot.hora].map(({ id }) => 
        ({ 
          miembro: id, 
          hora: slot.hora, 
          dia: slot.dia }
        ))
    ).flat();
  });

const insertNewMember = (newMember) => 
  knex.transaction(async trx => {
    const { entrada } = newMember;
    const membersWithSameHour = 
      await getMemberIDsByTrainingHour(entrada, trx);
    if (membersWithSameHour.length >= SLOT_CAPACITY)
      throw new FatalError('NEW_MEMBER_ENTRADA_CONSTR', { 
        entrada, 
        count: membersWithSameHour.length 
      });

    await insertMiembro(newMember, trx);
  });

const updateReservationsWithNewMember = (miembro, newSlots) => 
  knex.transaction(async trx => {
    const unavailableDays = 
      await findDaysWithHourFull(miembro.entrada, trx)

    const newReservations = newSlots
      .filter(s => !unavailableDays.includes(s.dia))
      .map(s => ({ ...s, miembro: miembro.id, hora: miembro.entrada }));
    await insertReservation(newReservations, trx);

    return {
      newData: await getOrderedTimetable(trx),
      unavailableDays
    };
  });

module.exports = { 
  checkMemberEntradaConstraint,
  clear, 
  createMonthReservations,
  findMiembroById, 
  insertMiembro,
  insertNewMember,
  pickChallengeWinners,
  setMemberRows,
  setReservationRows,
  updateReservationsWithNewMember,
};
