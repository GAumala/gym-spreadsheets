const { SheetBoundaryError } = require('./errors.js')
const { getMemberDataFromSheet } = require('./boundary.js');

const sheetMetadata = {
  docTitle: 'Test document',
  sheetTitle: '',
  rowCount: 10
};

describe('getMemberDataFromSheet', () => {
  it('accepts valid data and returns a sanitized value', () => {
    const rows = [
      {ID: null, 
       NOMBRE: 'Carlos Hernández', 
       EMAIL: '', 
       LESIONES: undefined, 
       ENTRADA: '07:00'},
      {ID: '', 
       NOMBRE: 'Luis Suarez', 
       EMAIL: undefined, 
       LESIONES: null, 
       ENTRADA: '07:00'},
      {ID: 'nestor_ponce', 
       NOMBRE: 'Nestor Ponce', 
       EMAIL: 'nponce@mail.com', 
       LESIONES: '', 
       ENTRADA: '12:00'},
    ];

    const expectedList = [
      {id: '', 
       nombre: 'Carlos Hernández', 
       email: '', 
       lesiones: '', 
       entrada: '07:00'},
      {id: '', 
       nombre: 'Luis Suarez', 
       email: '', 
       lesiones: '', 
       entrada: '07:00'},
      {id: 'nestor_ponce', 
       nombre: 'Nestor Ponce', 
       email: 'nponce@mail.com', 
       lesiones: '', 
       entrada: '12:00'},
    ]
    const sheetData = getMemberDataFromSheet(sheetMetadata, rows);
    expect(sheetData.data).toEqual(expectedList)
  });

  it('adds a translateKey function when data is correct', () => {
    const rows = [
      {NOMBRE: 'Nestor Ponce', 
       EMAIL: 'nponce@mail.com', 
       LESIONES: '', 
       ENTRADA: '12:00'},
    ];

    const { translateKey } = getMemberDataFromSheet(sheetMetadata, rows);
    expect(translateKey('nombre')).toEqual('NOMBRE');
  });

  it('throws SheetBoundaryError if data is invalid', () => {
    const rows = [
      {ID: null, 
       NOMBRE: 'Carlos Hernández', 
       EMAIL: '', 
       LESIONES: undefined, 
       ENTRADA: '07:00'},
      {ID: '', 
       NOMBRE: 'Luis Suarez', 
       EMAIL: undefined, 
       LESIONES: null, 
       ENTRADA: '07:00'},
      {NOMBRE: '', 
       EMAIL: 'nponce@mail.com', 
       LESIONES: '', 
       ENTRADA: '12:00'}
    ];

    expect(() => getMemberDataFromSheet(sheetMetadata, rows))
      .toThrow(SheetBoundaryError);
  });
});
