const { GoogleSpreadsheet } = require('google-spreadsheet');
const docIds = require('../docs.json')
const boundary = require('./boundary.js')
const manipulations = require('./sheets/manipulations.js');
const { FatalError } = require('./errors.js');

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
    manipulations.reconciliateData({ 
      sheet, rows, translateKey, originalData: data 
    });

  return { rows, data, reconciliateFn };
};

const loadMembers = async () => {
  const doc = await loadDoc(docIds.members);
  const sheet = doc.sheetsByIndex[0]; 
  const rows = await sheet.getRows();
  const metadata = collectSheetMetadata(doc, sheet);
  const { data, translateKey } = 
    boundary.getMemberDataFromSheet(metadata, rows);
  const reconciliateFn = 
    manipulations.reconciliateData({ 
      sheet, rows, translateKey, originalData: data 
    });

  return { rows, data, reconciliateFn };
};

const loadChallengeContestants = async () => {
  const doc = await loadDoc(docIds.challenge);
  const sheetStart = doc.sheetsByIndex[0]; 
  const sheetEnd = doc.sheetsByIndex[1]; 

  const rowsStart = await sheetStart.getRows();
  const metadataStart = collectSheetMetadata(doc, sheetStart);
  const { data: startData } = 
    boundary.getChallengeDataFromSheet(metadataStart, rowsStart);

  const rowsEnd = await sheetEnd.getRows();
  const metadataEnd = collectSheetMetadata(doc, sheetEnd);
  const { data: endData } = 
    boundary.getChallengeDataFromSheet(metadataEnd, rowsEnd);

  return { startData, endData };
};

const hasTimeTableSheet = async sheetTitle => {

}

const createTimeTableSheet = async sheetTitle => {
  const doc = await loadDoc(docIds.timetable);
  const existingSheet = doc.sheetsByTitle[sheetTitle];
  
  if (existingSheet)
    throw new FatalError('SHEET_ALREADY_EXISTS', { title: sheetTitle });

  const newSheet = await doc.addSheet({ 
    title: sheetTitle,
    headerValues: ['DÍA', 'HORA', 'MIEMBRO'] 
  });

  const rows = await newSheet.getRows();
  const translateKey = boundary.translateTimeSlotKey;
  const reconciliateFn = manipulations.reconciliateData({ 
    sheet: newSheet, rows, translateKey, originalData: []
  });
  
  return { rows, reconciliateFn, data: [] };
};

const loadTimeSlots = async (sheetTitle) => {
  const doc = await loadDoc(docIds.timetable);
  const sheet = doc.sheetsByTitle[sheetTitle];
  if (!sheet)
    return { err: 'SHEET_NOT_FOUND', timeTableMissing: true };

  const rows = await sheet.getRows();
  const translateKey = boundary.translateTimeSlotKey;
  const metadata = collectSheetMetadata(doc, sheet);
  const { data } = boundary.getTimetableDataFromSheet(metadata, rows);

  const reconciliateFn = manipulations.resetData({ 
    sheet, translateKey  
  });
  return { rows, reconciliateFn, data };
};

module.exports = { 
  createTimeTableSheet,
  loadChallengeContestants, 
  loadMemberIDs,
  loadMembers,
  loadTimeSlots
};
