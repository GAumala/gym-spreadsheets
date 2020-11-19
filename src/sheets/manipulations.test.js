const { reconciliateData } = require('./manipulations.js')

const mockRow = data => ({ 
  ...data, 
  save: jest.fn(() => Promise.resolve()),
  delete: jest.fn(() => Promise.resolve())
});

const mockSheet = () => ({ 
  addRows: jest.fn(() => Promise.resolve())
});

describe('reconciliateData', () => {
    const originalData = [
      {x: 'hello', y: 'apple', z: 'old'},
      {x: 'book', y: 'game', z: 'camera'},
      {x: 'world', y: '', z: 'yellow'},
      {x: 'sleep', y: 'car', z: 'phone'},
    ]
    const newData = [
      {x: 'hello', y: 'apple', z: 'new'},
      {x: 'book', y: 'game', z: 'camera'},
      {x: 'world', y: 'shirt', z: 'yellow'},
      {x: 'sleep', y: 'car', z: 'phone'},
    ]
    const translateKey = key => {
      switch (key) {
        case 'x': return 'X';
        case 'y': return 'Y';
        case 'z': return 'Z';
        default: return key;
      }
    }

  it('only edits and saves on rows that changed', async () => {
    const rows = [
      mockRow({X: 'hello', Y: 'apple', Z: 'old'}),
      mockRow({X: 'book', Y: 'game', Z: 'camera'}),
      mockRow({X: 'world', Y: '', Z: 'yellow'}),
      mockRow({X: 'sleep', Y: 'car', Z: 'phone'}),
    ];

    const sheet = {};
    const ctx = {sheet, rows, translateKey, originalData};
    await reconciliateData(ctx)(newData);

    expect(rows[0].Z).toBe('new');
    expect(rows[0].save).toHaveBeenCalled();
    expect(rows[1].save).not.toHaveBeenCalled();
    expect(rows[2].Y).toBe('shirt');
    expect(rows[2].save).toHaveBeenCalled();
    expect(rows[3].save).not.toHaveBeenCalled();
  });

  it('returns the number of edited cells', async () => {
    const rows = [
      mockRow({X: 'hello', Y: 'apple', Z: 'old'}),
      mockRow({X: 'book', Y: 'game', Z: 'camera'}),
      mockRow({X: 'world', Y: '', Z: 'yellow'}),
      mockRow({X: 'sleep', Y: 'car', Z: 'phone'}),
    ];

    const sheet = {};
    const ctx = {sheet, rows, translateKey, originalData};
    const res = await reconciliateData(ctx)(newData);
    expect(res.editedCells).toBe(2);
  });

  it('deletes tail rows if new data has less rows', async () => {
    const alteredNewData = [
      {x: 'hello', y: 'apple', z: 'old'},
      {x: 'book', y: 'game', z: 'camera'},
      {x: 'sleep', y: 'car', z: 'phone'},
    ]

    const rows = [
      mockRow({X: 'hello', Y: 'apple', Z: 'old'}),
      mockRow({X: 'book', Y: 'game', Z: 'camera'}),
      mockRow({X: 'world', Y: '', Z: 'yellow'}),
      mockRow({X: 'sleep', Y: 'car', Z: 'phone'}),
    ];

    const sheet = {};
    const ctx = {sheet, rows, translateKey, originalData};
    await reconciliateData(ctx)(alteredNewData);

    expect(rows[0].delete).not.toHaveBeenCalled();
    expect(rows[0].save).not.toHaveBeenCalled();
    expect(rows[1].delete).not.toHaveBeenCalled();
    expect(rows[1].save).not.toHaveBeenCalled();
    expect(rows[2].X).toBe('sleep');
    expect(rows[2].Y).toBe('car');
    expect(rows[2].Z).toBe('phone');
    expect(rows[2].save).toHaveBeenCalled();
    expect(rows[3].save).not.toHaveBeenCalled();
    expect(rows[3].delete).toHaveBeenCalled();
  });

  it('adds tail rows if new data has more rows', async () => {
    const alteredNewData = [
      {x: 'hello', y: 'apple', z: 'old'},
      {x: 'book', y: 'game', z: 'camera'},
      {x: 'world', y: '', z: 'yellow'},
      {x: 'sleep', y: 'car', z: 'phone'},
      {x: 'dawn', y: 'bike', z: 'tablet'},
    ]

    const rows = [
      mockRow({X: 'hello', Y: 'apple', Z: 'old'}),
      mockRow({X: 'book', Y: 'game', Z: 'camera'}),
      mockRow({X: 'world', Y: '', Z: 'yellow'}),
      mockRow({X: 'sleep', Y: 'car', Z: 'phone'}),
    ];

    const sheet = mockSheet();
    const ctx = {sheet, rows, translateKey, originalData};
    await reconciliateData(ctx)(alteredNewData);

    expect(rows[0].delete).not.toHaveBeenCalled();
    expect(rows[0].save).not.toHaveBeenCalled();
    expect(rows[1].delete).not.toHaveBeenCalled();
    expect(rows[1].save).not.toHaveBeenCalled();
    expect(rows[2].delete).not.toHaveBeenCalled();
    expect(rows[2].save).not.toHaveBeenCalled();
    expect(rows[3].delete).not.toHaveBeenCalled();
    expect(rows[3].save).not.toHaveBeenCalled();
    
    const newRows = [{X: 'dawn', Y: 'bike', Z: 'tablet'}];
    expect(sheet.addRows)
      .toHaveBeenCalledWith(newRows, {raw: true});
  });
});
