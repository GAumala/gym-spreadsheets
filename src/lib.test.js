const { createUserId, setMissingUserIds } = require('./lib.js')

describe('createUserId', () => {
  it('removes accents and switches to lower case', () => {
    expect(createUserId('Jorge Cárdenas')).toBe('jorge_cardenas');
  });

  it('removes all special chars', () => {
    expect(createUserId('Jorge Cárdenas*')).toBe('jorge_cardenas');
  });

  it('removes extra white space', () => {
    expect(createUserId('\tVerónica  Muñoz  \r\n')).toBe('veronica_munoz');
  });
});

describe('setMissingUserIds', () => {
  it("sets user id to the rows that don't have one in a new array", () => {
    const rows = [
      {nombre: 'Julio Castro', id: 'jcastro', email: 'jcastro@mail.com'},
      {nombre: 'Víctor Sánchez', email: 'vsanchez@mail.com'},
      {nombre: 'Eduardo Nuñez', email: 'enunez@mail.com'},
    ]

    expected = [
      {nombre: 'Julio Castro', id: 'jcastro', email: 'jcastro@mail.com'},
      {nombre: 'Víctor Sánchez', id: 'victor_sanchez', email: 'vsanchez@mail.com'},
      {nombre: 'Eduardo Nuñez', id: 'eduardo_nunez', email: 'enunez@mail.com'},
    ]

    expect(setMissingUserIds(rows)).toEqual(expected);
  });

  it('Handles users with same names', () => {
    const rows = [
      {nombre: 'Jorge Martinez', email: 'jmartinez@mail.com'},
      {nombre: 'Víctor Sánchez', email: 'vsanchez@mail.com'},
      {nombre: 'Eduardo Nuñez', email: 'enunez@mail.com'},
      {nombre: 'Jorge Martinez'},
    ]

    expected = [
      {nombre: 'Jorge Martinez', id: 'jorge_martinez', email: 'jmartinez@mail.com'},
      {nombre: 'Víctor Sánchez', id: 'victor_sanchez', email: 'vsanchez@mail.com'},
      {nombre: 'Eduardo Nuñez', id: 'eduardo_nunez', email: 'enunez@mail.com'},
      {nombre: 'Jorge Martinez', id: 'jorge_martinez1' },
    ]
    expect(setMissingUserIds(rows)).toEqual(expected);
  })

});
