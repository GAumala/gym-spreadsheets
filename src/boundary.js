const {
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

module.exports = {
  getMemberDataFromSheet,
  getMemberIdDataFromSheet,
  translateMemberKey,
};
