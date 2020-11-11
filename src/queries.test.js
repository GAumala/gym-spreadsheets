const db = require('./db.js')
const q = require('./queries.js')

beforeEach(() => q.clear());

afterAll(() => db.destroy());

describe('findMiembroById', () => {
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
