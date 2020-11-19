const {
  challengeArraySchema,
  memberArraySchema, 
  memberIdentificationArraySchema
} = require('./schemas.js')
const {SheetBoundaryError} = require('./errors.js')

const getAsString = (value) => {
  if (typeof value === 'string')
    return value.trim();

  if (value == undefined || value == null)
    return '';

  return '' + value;
}

const translateMemberKey = key => {
  switch (key) {
    case 'id': return 'ID';
    case 'nombre': return 'NOMBRE';
    case 'email': return 'EMAIL';
    case 'entrada': return 'ENTRADA';
    case 'lesiones': return 'LESIONES';
    default: return key;
  }
};

const translateChallengeKey = key => {
  switch (key) {
    case 'id': return 'ID';
    case 'peso': return 'PESO';
    case 'fat': return '%FAT';
    case 'muscle': return '%MUSCL';
    default: return key;
  }
};

const translateTimetableKey = key => {
  switch (key) {
    case 'dia': return 'DÍA';
    case 'hora': return 'HORA';
    case 'miembro': return 'MIEMBRO';
    default: return key;
  }
};

const runBoundary = args => {
  const {schema, mapRowsFn, translateKeyFn, metadata, sheetRows} = args;
  const validation = schema.validate(sheetRows.map(mapRowsFn));

  if (validation.error) {
    const docInfo = {...metadata, translateKey: translateKeyFn};
    throw new SheetBoundaryError(docInfo, validation.error);
  }

  return { 
    data: validation.value, 
    translateKey: translateKeyFn 
  }
}

const getMemberIdDataFromSheet = (metadata, sheetRows) => 
  runBoundary({
    schema: memberIdentificationArraySchema,
    mapRowsFn: row => ({
      id: getAsString(row.ID),
      nombre: getAsString(row.NOMBRE)
    }),
    translateKeyFn: translateMemberKey,
    metadata,
    sheetRows
  });

const getMemberDataFromSheet = (metadata, sheetRows) => 
  runBoundary({
    schema: memberArraySchema,
    mapRowsFn: row => ({
      id: getAsString(row.ID),
      nombre: getAsString(row.NOMBRE),
      email: getAsString(row.EMAIL),
      entrada: getAsString(row.ENTRADA),
      lesiones: getAsString(row.LESIONES)
    }),
    translateKeyFn: translateMemberKey,
    metadata,
    sheetRows
  });

const getChallengeDataFromSheet = (metadata, sheetRows) => 
  runBoundary({
    schema: challengeArraySchema,
    mapRowsFn: row => ({
      id: getAsString(row.ID),
      peso: row.PESO,
      fat: row['%FAT'],
      muscle: row['%MUSCL']
    }),
    translateKeyFn: translateChallengeKey,
    metadata,
    sheetRows
  });


module.exports = {
  getChallengeDataFromSheet,
  getMemberDataFromSheet,
  getMemberIdDataFromSheet,
  translateChallengeKey,
  translateMemberKey,
  translateTimetableKey
};
