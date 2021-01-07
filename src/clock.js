/**
 * Get an array with the next month and its year ([YYYY MM])
 * relative to system time.
 */
const getYearAndNextMonth = () => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 2;
  return [year, month];
};

/**
 * Get an array with the curent year and month ([YYYY MM])
 * relative to system time.
 */
const getYearAndMonth = () => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  return [year, month];
};

/**
 * Get an array with the curent date, hour amd minutes ([dd hh mm ss])
 * relative to system time.
 */
const getDateHoursAndMinutes = () => {
  const currentDate = new Date();
  const date = currentDate.getDate();
  const hours = currentDate.getHours();
  const minutes = currentDate.getMinutes();

  return [date, hours, minutes]
}

/**
 * Get a full date array  with the curent time, ([YYYY mm dd hh mm ss])
 * relative to system time.
 */
const getFullDateArray = () => 
  [...getYearAndMonth(), ...getDateHoursAndMinutes()];

module.exports = {
  getYearAndMonth,
  getYearAndNextMonth, 
  getFullDateArray,
}
