const knex = require('./db.js')

const clear = (db = knex) => Promise.all([
  db('reserva').truncate(), 
  db('challengeStart').truncate(), 
  db('challengeEnd').truncate(), 
  db('miembro').truncate()
]);

const clearMembers = (db = knex) => db('miembro').truncate();

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

module.exports = { 
  clear, 
  pickChallengeWinners,
  findMiembroById, 
  insertMiembro,
  setMemberRows
}
