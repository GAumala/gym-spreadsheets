const dbConnection = require('./db.js')
const sheetsAPI = require('./sheets.js')
const clock = require('./clock.js')
const db = require('./db/queries.js')
const SheetsAdmin = require('./SheetsAdmin.js')

const main = async () => {
  const admin = new SheetsAdmin({ sheetsAPI, db, clock });
  const args = { nombre: 'Steeven Mendoza', entrada: '11:00' };
  await admin.addNewMember(args);
};

main()
.then(res => console.log('Listo!'))
.catch(e => console.error(e))
.then(() => dbConnection.destroy());
