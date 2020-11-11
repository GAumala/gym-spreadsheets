const { getMembersFromSheetRows } = require('./schemas.js');

describe('getMembersFromSheetRows', () => {
  it('accepts valid data and returns a sanitized value', () => {
    const rows = [
      {ID: null, 
       NOMBRE: 'Carlos Hernández', 
       EMAIL: '', 
       LESIONES: undefined, 
       ENTRADA: '9:00'},
      {ID: '', 
       NOMBRE: 'Luis Suarez', 
       EMAIL: undefined, 
       LESIONES: null, 
       ENTRADA: '9:00'},
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
       entrada: '9:00'},
      {id: '', 
       nombre: 'Luis Suarez', 
       email: '', 
       lesiones: '', 
       entrada: '9:00'},
      {id: 'nestor_ponce', 
       nombre: 'Nestor Ponce', 
       email: 'nponce@mail.com', 
       lesiones: '', 
       entrada: '12:00'},
    ]
    const memberData = getMembersFromSheetRows(rows);
    expect(memberData.value).toEqual(expectedList)
  });

  it('adds a translateKey function when data is correct', () => {
    const rows = [
      {NOMBRE: 'Nestor Ponce', 
       EMAIL: 'nponce@mail.com', 
       LESIONES: '', 
       ENTRADA: '12:00'},
    ];

    const { translateKey } = getMembersFromSheetRows(rows);
    expect(translateKey('nombre')).toEqual('NOMBRE');
  });

  it('returns an error attribute if data is invalid', () => {
    const rows = [
      {ID: null, 
       NOMBRE: 'Carlos Hernández', 
       EMAIL: '', 
       LESIONES: undefined, 
       ENTRADA: '9:00'},
      {ID: '', 
       NOMBRE: 'Luis Suarez', 
       EMAIL: undefined, 
       LESIONES: null, 
       ENTRADA: '9:00'},
      {NOMBRE: '', 
       EMAIL: 'nponce@mail.com', 
       LESIONES: '', 
       ENTRADA: '12:00'}
    ];

    const { error } = getMembersFromSheetRows(rows);
    const expectedMsg = 
      expect.stringMatching(/^\"\[0\].entrada\" must be one of/g)
    expect(error.message).toEqual(expectedMsg)
  });
});
