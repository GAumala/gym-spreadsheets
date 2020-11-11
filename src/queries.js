const knex = require('./db.js')

const clear = (db = knex) => Promise.all([
  db('reserva').truncate(), 
  db('medicionDiff').truncate(), 
  db('miembro').truncate()
]);

const insertMiembro = (data, db = knex) => 
  db.table('miembro').insert(data);
const insertMedicionDiff = (data, db = knex) => 
  db.table('medicionDiff').insert(data);
const insertReserva = (data, db = knex) => 
  db.table('reserva').insert(data);

const findMiembroById = (id, db = knex) => db.select('*')
  .from('miembro').where({ id });

module.exports = { clear, findMiembroById, insertMiembro }
