const db = require('./db.js')
const sheetsAPI = require('./sheets.js')
const operations = require('./operations.js')
const dateHelpers = require('./lib/dateHelpers.js')

const main = async () => {
  const deps = {
    getYearAndNextMonth: dateHelpers.getYearAndNextMonth,
    createTimeTableSheet: sheetsAPI.createTimeTableSheet,
    loadMembers: sheetsAPI.loadMembers
  };

  return operations.createTimeTableSheet(deps);
}

main()
.then(res => console.log('Listo!'))
.catch(e => console.error(e))
.then(() => db.destroy());
