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

module.exports = {
  getFirstDayOfMonth,
  getNumberOfDaysInMonth,
}
