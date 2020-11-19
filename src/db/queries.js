const knex = require('../db.js')
const { trainingHours } = require('../lib/constants.js');

const clear = (db = knex) => Promise.all([
  db('reserva').truncate(), 
  db('challengeStart').truncate(), 
  db('challengeEnd').truncate(), 
  db('miembro').truncate()
]);

const clearMembers = (db = knex) => db('miembro').truncate();
const clearReservas = (db = knex) => db('reserva').truncate();

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
const insertReserva = (data, db = knex) => 
  db.table('reserva').insert(data);

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
    return insertMiembro(rows, trx);
  });

const getMemberIDsByTrainingHour = (entrada, db = knex) => 
  db.from('miembro')
    .select('id')
    .where({ entrada })
    .limit(10);

const createMembersByHourMap = async (db = knex) => {
  const membersByHour = {};
  for (let i = 0; i < trainingHours.length; i++) {
    const hour = trainingHours[i];
    const members = await getMemberIDsByTrainingHour(hour, db);
    membersByHour[hour] = members;
  }
  return membersByHour;
}

const checkExcessMembersInTimeSlot = () => 
  knex.from('miembro')
    .select(knex.raw('entrada, COUNT(id) as count'))
    .groupBy('entrada')
    .having('count', '>', 9)

const createMonthReservations = monthSlots => 
  knex.transaction(async trx => {
    await clearReservas(trx);

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

module.exports = { 
  checkExcessMembersInTimeSlot,
  clear, 
  createMonthReservations,
  findMiembroById, 
  insertMiembro,
  pickChallengeWinners,
  setMemberRows
}
