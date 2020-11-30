const {
  moveDateArrayToMinuteEarlier,
  moveDateArrayToNextMonthStart,
  moveDateArrayToNextTrainingHour,
  moveDateArrayToFutureDay,
} = require('./dateArray.js');

describe('moveDateArrayToNextMonthStart', () => {
  it('moves a January date array', () => {
    const dateArray = [2020, 1, 31, 14, 30];
    const result = moveDateArrayToNextMonthStart(dateArray);
    expect(result).toEqual([2020, 2, 1, 0, 0]);
  })
});

describe('moveDateArrayToNextTrainingHour', () => {
  it('returns the dateArray in the next training hour on the same day', () => {
    const dateArray = [2020, 11, 26, 14, 30];
    const result = moveDateArrayToNextTrainingHour(dateArray);
    expect(result).toEqual([2020, 11, 26, 17, 0]);
  })

  it('returns same input if it matches a training hour', () => {
    const dateArray = [2020, 11, 26, 9, 30];
    const result = moveDateArrayToNextTrainingHour(dateArray);
    expect(result).toEqual(dateArray);
  })

  it('returns the dateArray at start of next month if there are no more hours in this month', () => {
    const dateArray = [2020, 11, 30, 19, 1];
    const result = moveDateArrayToNextTrainingHour(dateArray);
    expect(result).toEqual([2020, 12, 1, 6, 0]);
  })

  it('returns the dateArray at start of next year if there are no more hours in this year', () => {
    const dateArray = [2020, 12, 31, 19, 1];
    const result = moveDateArrayToNextTrainingHour(dateArray);
    expect(result).toEqual([2021, 1, 1, 6, 0]);
  })

  it('returns the dateArray at start of next monday if input falls on a sunday', () => {
    const dateArray = [2020, 11, 29, 4, 0];
    const result = moveDateArrayToNextTrainingHour(dateArray);
    expect(result).toEqual([2020, 11, 30, 6, 0]);
  });
});

describe('moveDateArrayToFutureDay', () => {
  it('returns the dateArray with the next day', () => {
    const dateArray = [2020, 11, 29, 8, 0];
    const result = moveDateArrayToFutureDay(dateArray, 30);
    expect(result).toEqual([2020, 11, 30, 8, 0]);
  });
  
  it('returns the dateArray with a day in the next month', () => {
    const dateArray = [2020, 11, 29, 8, 0];
    const result = moveDateArrayToFutureDay(dateArray, 1);
    expect(result).toEqual([2020, 12, 1, 8, 0]);
  });

  it('returns the dateArray with a more recent day if next month does not have enough days', () => {
    const dateArray = [2020, 1, 31, 9, 30];
    const result = moveDateArrayToFutureDay(dateArray, 30);
    expect(result).toEqual([2020, 2, 29, 9, 30]);
  });
});

describe('moveDateArrayToMinuteEarlier', () => {
  it('works with input with  minute 30', () => {
    const dateArray = [2020, 11, 29, 9, 30];
    const result = moveDateArrayToMinuteEarlier(dateArray);
    expect(result).toEqual([2020, 11, 29, 9, 29]);
  });

  it('works with input with minute 0', () => {
    const dateArray = [2020, 11, 29, 8, 0];
    const result = moveDateArrayToMinuteEarlier(dateArray);
    expect(result).toEqual([2020, 11, 29, 7, 59]);
  });

  it('works with input with minute 0 and hour 0', () => {
    const dateArray = [2020, 11, 29, 0, 0];
    const result = moveDateArrayToMinuteEarlier(dateArray);
    expect(result).toEqual([2020, 11, 28, 23, 59]);
  });

  it('works with input with minute 0, hour 0, and day 1', () => {
    const dateArray = [2020, 11, 1, 0, 0];
    const result = moveDateArrayToMinuteEarlier(dateArray);
    expect(result).toEqual([2020, 10, 31, 23, 59]);
  });

  it('works with input with minute 0, hour 0, day 1, and month 1', () => {
    const dateArray = [2021, 1, 1, 0, 0];
    const result = moveDateArrayToMinuteEarlier(dateArray);
    expect(result).toEqual([2020, 12, 31, 23, 59]);
  });
});

