const getFirstDayOfMonth = (year, month) => {
  const date = new Date()
  date.setYear(year);
  date.setMonth(month - 1);
  date.setDate(1);

  return date.getDay();
}

const getNumberOfDaysInMonth = (year, month) => {
  const date = new Date()
  date.setYear(year);
  date.setMonth(month); // next month
  date.setDate(0); // this actually sets last day of prev month

  return date.getDate();
}

const getNextMonth = (year, month) => {
  const nextMonth = month == 12 ? 1 : month + 1;
  const maybeNextYear = month == 12 ? year + 1 : year;
  return [maybeNextYear, nextMonth];
}

module.exports = {
  getFirstDayOfMonth,
  getNextMonth,
  getNumberOfDaysInMonth,
}
