const sheetsAPI = require('./sheets.js')
const operations = require('./operations.js')

const main = async () => {
  const deps = {
    loadMemberIDs: sheetsAPI.loadMemberIDs
  };
  return operations.setMissingUserIDs(deps);
}

main()
.then(res => console.log('Exito! Celdas modificadas: ' + res.editedCells))
.catch(e => console.error(e));
