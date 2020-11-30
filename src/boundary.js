const {
  challengeArraySchema,
  memberArraySchema, 
  memberIdentificationArraySchema,
  newMemberSchema,
  newReservationSchema,
  timeSlotArraySchema,
  timeSchema
} = require('./schemas.js')
const {
  SheetBoundaryError,
  UserInputBoundaryError
} = require('./errors.js')

const badHourFormatRegex = new RegExp('^[0-9]:[0-9][0-9]$');

const getAsString = (value) => {
  if (typeof value === 'string')
    return value.trim();

  if (value == undefined || value == null)
    return '';

  return '' + value;
}

const getAsHourString = (value) => {
  if (value === undefined)
    return undefined;

  const stringValue = getAsString(value);
  if (badHourFormatRegex.test(stringValue))
    return '0' + stringValue;

  return stringValue;
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

const translateTimeSlotKey = key => {
  switch (key) {
    case 'dia': return 'DÍA';
    case 'hora': return 'HORA';
    case 'miembro': return 'MIEMBRO';
    default: return key;
  }
};

const runSheetBoundary = args => {
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

const runUserInputBoundary = args => {
  const {schema, input} = args;
  const validation = schema.validate(input);

  if (validation.error) {
    throw new UserInputBoundaryError(validation.error);
  }

  return { 
    data: validation.value, 
  }
}

const getMemberIdDataFromSheet = (metadata, sheetRows) => 
  runSheetBoundary({
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
  runSheetBoundary({
    schema: memberArraySchema,
    mapRowsFn: row => ({
      id: getAsString(row.ID),
      nombre: getAsString(row.NOMBRE),
      email: getAsString(row.EMAIL),
      entrada: getAsHourString(row.ENTRADA),
      lesiones: getAsString(row.LESIONES)
    }),
    translateKeyFn: translateMemberKey,
    metadata,
    sheetRows
  });

const getChallengeDataFromSheet = (metadata, sheetRows) => 
  runSheetBoundary({
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

const getTimetableDataFromSheet = (metadata, sheetRows) => 
  runSheetBoundary({
    schema: timeSlotArraySchema,
    mapRowsFn: row => ({
      miembro: getAsString(row.MIEMBRO),
      dia: getAsString(row['DÍA']),
      hora: getAsHourString(row.HORA),
    }),
    translateKeyFn: translateTimeSlotKey,
    metadata,
    sheetRows
  });

const getNewMemberFromUserInput = input => 
  runUserInputBoundary({
    schema: newMemberSchema,
    input
  });

const getNewReservationFromUserInput = input => 
  runUserInputBoundary({
    schema: newReservationSchema,
    input: {
      miembro: input.miembro,
      diaNumero: input.dia,
      hora: getAsHourString(input.hora)
    }
  });

const getTimeFromUserInput = input => 
  runUserInputBoundary({
    schema: timeSchema,
    input: {
      diaNumero: input.dia,
      hora: getAsHourString(input.hora)
    }
  });

module.exports = {
  getChallengeDataFromSheet,
  getMemberDataFromSheet,
  getMemberIdDataFromSheet,
  getNewMemberFromUserInput,
  getNewReservationFromUserInput,
  getTimeFromUserInput,
  getTimetableDataFromSheet,
  translateChallengeKey,
  translateMemberKey,
  translateTimeSlotKey
};
