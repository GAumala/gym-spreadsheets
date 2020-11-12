const sheetsAPI = require('./sheets.js')
const operations = require('./operations.js')

const main = async () => {
  const deps = {
    loadMemberIDRows: sheetsAPI.loadMemberIDRows
  };
  return operations.setMissingUserIds(deps);
}

main()
.then(res => console.log('Exito! Celdas modificadas: ' + res.editedCells))
.catch(e => console.error(e));
