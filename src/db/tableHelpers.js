const { 
  numberToThousandthInt 
} = require('./lib/units.js')

const createChallengeDBRows = (challengeColumn, sheetData) => {
  return sheetData
    .filter(item => !!item[challengeColumn])
    .map(item => ({ 
      miembro: item.id, 
      medicion: numberToThousandthInt(item[challengeColumn]) 
    }));
}

module.exports = {
  createChallengeDBRows
};
