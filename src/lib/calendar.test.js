const { 
  getNextMonth,
  getFirstDayOfMonth, 
  getNumberOfDaysInMonth 
} = require('./calendar.js');

describe('getFirstDayOfMonth', () => {
  it('returns the correct value for all 2021', () => {
    const firstDays = [
      getFirstDayOfMonth(2021, 1),
      getFirstDayOfMonth(2021, 2),
      getFirstDayOfMonth(2021, 3),
      getFirstDayOfMonth(2021, 4),
      getFirstDayOfMonth(2021, 5),
      getFirstDayOfMonth(2021, 6),
      getFirstDayOfMonth(2021, 7),
      getFirstDayOfMonth(2021, 8),
      getFirstDayOfMonth(2021, 9),
      getFirstDayOfMonth(2021, 10),
      getFirstDayOfMonth(2021, 11),
      getFirstDayOfMonth(2021, 12),
    ]
    expect(firstDays).toEqual([
      5, 1, 1, 4, 6, 2, 4, 0, 3, 5, 1, 3
    ]);
  });
});

describe('getNumberOfDaysInMonth', () => {
  it('returns the correct value for all 2021', () => {
    const firstDays = [
      getNumberOfDaysInMonth(2021, 1),
      getNumberOfDaysInMonth(2021, 2),
      getNumberOfDaysInMonth(2021, 3),
      getNumberOfDaysInMonth(2021, 4),
      getNumberOfDaysInMonth(2021, 5),
      getNumberOfDaysInMonth(2021, 6),
      getNumberOfDaysInMonth(2021, 7),
      getNumberOfDaysInMonth(2021, 8),
      getNumberOfDaysInMonth(2021, 9),
      getNumberOfDaysInMonth(2021, 10),
      getNumberOfDaysInMonth(2021, 11),
      getNumberOfDaysInMonth(2021, 12),
    ]
    expect(firstDays).toEqual([
      31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31
    ]);
  });

  it('handles leap years', () => {
    expect(getNumberOfDaysInMonth(2024, 2)).toBe(29);
  });
});

describe('getNextMonth', () => {
  it('returns same year if current month is not December', () => {
    expect(getNextMonth(2020, 1)).toEqual([2020, 2]);
    expect(getNextMonth(2020, 3)).toEqual([2020, 4]);
    expect(getNextMonth(2020, 5)).toEqual([2020, 6]);
    expect(getNextMonth(2020, 11)).toEqual([2020, 12]);
  });
  it('returns next year if current month is December', () => {
    expect(getNextMonth(2020, 12)).toEqual([2021, 1]);
    expect(getNextMonth(2021, 12)).toEqual([2022, 1]);
    expect(getNextMonth(2022, 12)).toEqual([2023, 1]);
  });
});
