const { reconciliateCellEdits } = require('./sheet_manipulations.js')

describe('reconciliateCellEdits', () => {
  it('only edits and saves on rows that changed', () => {
    const oldData = [
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

    const rows = [
      {X: 'hello', Y: 'apple', Z: 'old', save: jest.fn() },
      {X: 'book', Y: 'game', Z: 'camera', save: jest.fn() },
      {X: 'world', Y: '', Z: 'yellow', save: jest.fn() },
      {X: 'sleep', Y: 'car', Z: 'phone', save: jest.fn()},
    ]

    reconciliateCellEdits(rows, translateKey, oldData)(newData);

    expect(rows[0].Z).toBe('new');
    expect(rows[0].save).toHaveBeenCalled();
    expect(rows[1].save).not.toHaveBeenCalled();
    expect(rows[2].Y).toBe('shirt');
    expect(rows[2].save).toHaveBeenCalled();
    expect(rows[3].save).not.toHaveBeenCalled();
  });


});
