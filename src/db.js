const fs = require('fs');

const tablesStatements = 
  fs.readFileSync(__dirname + '/tables.sql', { encoding: 'utf8' });

const buildTables = (conn, done) => {
  conn.serialize(() => {
    conn.run('PRAGMA foreign_keys = ON');
    conn.exec(tablesStatements, () => {
      done();
    });
  });
}

const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: ':memory:'
  },
  pool: {
    afterCreate: buildTables
  },
  // debug: true,
});


module.exports = knex;
