const db = require('./db.js')
const q = require('./queries.js')


afterAll(() => db.destroy());

describe('findMiembroById', () => {

  beforeEach(() => q.clear());

  it('returns inserted rows', async () => {
    const row = {
      id: 'viviana_ruiz',
      nombre: 'Viviana Ruiz',
      email: 'vruiz@mail.com',
      entrada: '10:00',
      lesiones: '',
    };
    await q.insertMiembro(row);

    const expected = [{ ...row, rowid: expect.any(Number) }];
    const results = await q.findMiembroById('viviana_ruiz');
    expect(results).toEqual(expected);
  });
});

describe('pickChallengeWinners', () => {
  beforeAll(async () => {
    await q.clear();

    const miembros = [
      {
        id: 'jeff',
        nombre: 'Jeff',
        email: '',
        entrada: '10:00',
        lesiones: '',    
      },
      {
        id: 'tom',
        nombre: 'Tom',
        email: '',
        entrada: '10:00',
        lesiones: '',    
      },
      {
        id: 'bill',
        nombre: 'Bill',
        email: '',
        entrada: '10:00',
        lesiones: '',    
      },
      {
        id: 'harry',
        nombre: 'Harry',
        email: '',
        entrada: '10:00',
        lesiones: '',    
      },
    ];
    await q.insertMiembro(miembros);
  });

  it('returns the 3 rows with highest diff', async () => {
    const startData = [
      { miembro: 'jeff', medicion: 41000 },
      { miembro: 'tom', medicion: 45000 },
      { miembro: 'bill', medicion: 52000 },
      { miembro: 'harry', medicion: 47300 },
    ];
    const endData = [
      { miembro: 'jeff', medicion: 40000 },
      { miembro: 'tom', medicion: 41400 },
      { miembro: 'bill', medicion: 49400 },
      { miembro: 'harry', medicion: 47100 },
    ];

    const expected = [
      { nombre: 'Tom', start: 45000, end: 41400, diff: 3600 },
      { nombre: 'Bill', start: 52000, end: 49400, diff: 2600 },
      { nombre: 'Jeff', start: 41000, end: 40000, diff: 1000 },
    ];

    const results = await q.pickChallengeWinners(startData, endData);
    expect(results).toEqual(expected);
  });
});
