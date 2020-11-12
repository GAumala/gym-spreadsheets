const { GoogleSpreadsheet } = require('google-spreadsheet');
const docIds = require('../docs.json')
const boundary = require('./boundary.js')
const manipulations = require('./sheet_manipulations.js');

const loadDoc = async id => {
  const doc = new GoogleSpreadsheet(id);
  const credentials = require('../google_credentials.json');
  await doc.useServiceAccountAuth(credentials);
  await doc.loadInfo(); // loads document properties and worksheets
  return doc;
};

const collectSheetMetadata = (doc, sheet) => ({
  docTitle: doc.title,
  sheetTitle: sheet.title,
  rowCount: sheet.rowCount,
});

const loadMemberIDs = async () => {
  const doc = await loadDoc(docIds.members);
  const sheet = doc.sheetsByIndex[0]; 
  const rows = await sheet.getRows();
  const metadata = collectSheetMetadata(doc, sheet);
  const { data, translateKey } = 
    boundary.getMemberIdDataFromSheet(metadata, rows);
  const reconciliateFn = 
    manipulations.reconciliateCellEdits(rows, translateKey, data);

  return { rows, data, reconciliateFn };
};

module.exports = { loadMemberIDs };
