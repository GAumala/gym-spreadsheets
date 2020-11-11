const sheetsAPI = require('./sheets.js')
const operations = require('./operations.js')

const main = async () => {
  const deps = {
    loadMemberRows: sheetsAPI.loadMemberRows
  };
  operations.setMissingUserIds(deps);
}

main()
.catch(e => console.error(e));
