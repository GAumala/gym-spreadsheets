const { GoogleSpreadsheet } = require('google-spreadsheet');
const docIds = require('../docs.json')
const schemas = require('./schemas.js')
const manipulations = require('./sheet_manipulations.js');

const loadDoc = async id => {
  const doc = new GoogleSpreadsheet(id);
  const credentials = require('../google_credentials.json');
  await doc.useServiceAccountAuth(credentials);
  await doc.loadInfo(); // loads document properties and worksheets
  return doc;
}

const loadMemberRows = async () => {
  const doc = await loadDoc(docIds.members);
  const sheet = doc.sheetsByIndex[0]; 
  const rows = await sheet.getRows();
  const validationRes = schemas.getMembersFromSheetRows(rows);
  if (validationRes.error)
    return validationRes

  const { value, translateKey } = validationRes;
  return { 
    rows,
    data: value, 
    reconciliateCellEdits: 
      manipulations.reconciliateCellEdits(rows, translateKey, value)
  };
}

module.exports = { loadMemberRows };
