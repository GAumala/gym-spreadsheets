const { SheetBoundaryError } = require('./errors.js');
const { memberArraySchema } = require('./schemas.js');
const { translateMemberKey } = require('./boundary.js');

const createBoundaryError = (docInfo, schema, data) => {
  const validation = schema.validate(data);
  return new SheetBoundaryError(docInfo, validation.error);
}

describe('SheetBoundaryError', () => {
  it('uses Joi error data to create empty string error msg', () => {
    const docInfo = {
      docTitle: 'Test Document',
      sheetTitle: '',
      rowCount: 2,
      translateKey: translateMemberKey
    };

    const data = [
      {id: '', 
       nombre: 'Carlos Hernández', 
       email: '', 
       lesiones: '', 
       entrada: '07:00'},
      {id: '', 
       nombre: '', 
       email: '', 
       lesiones: '', 
       entrada: '07:00'}
    ];
    const error = createBoundaryError(docInfo, memberArraySchema, data);
    expect(error.message).toMatchSnapshot();
  });

it('uses Joi error data to create excluded value error msg', () => {
    const docInfo = {
      docTitle: 'Test Document',
      sheetTitle: '',
      rowCount: 2,
      translateKey: translateMemberKey
    };

    const data = [
      {id: '', 
       nombre: 'Carlos Hernández', 
       email: '', 
       lesiones: '', 
       entrada: '13:00'},
      {id: '', 
       nombre: 'Víctor Borja', 
       email: '', 
       lesiones: '', 
       entrada: '07:00'}
    ];
    const error = createBoundaryError(docInfo, memberArraySchema, data);
    expect(error.message).toMatchSnapshot();
  });
});
