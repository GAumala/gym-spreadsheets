const db = require('./db.js')
const sheetsAPI = require('./sheets.js')
const operations = require('./operations.js')

const main = async () => {
  const deps = {
    loadChallengeContestants: sheetsAPI.loadChallengeContestants,
    loadMembers: sheetsAPI.loadMembers
  };

  return operations.pickChallengeWinners(deps);
}

main()
.then(res => console.log('Los ganadores son:\n', res))
.catch(e => console.error(e))
.then(() => db.destroy());
