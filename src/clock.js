const getYearAndNextMonth = () => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 2;
  return [year, month];
};

const getYearAndMonth = () => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  return [year, month];
};

const getDateHoursAndMinutes = () => {
  const currentDate = new Date();
  const date = currentDate.getDate();
  const hours = currentDate.getHours();
  const minutes = currentDate.getMinutes();

  return [date, hours, minutes]
}

const getFullDateArray = () => 
  [...getYearAndMonth(), ...getDateHoursAndMinutes()];

module.exports = {
  getYearAndMonth,
  getYearAndNextMonth, 
  getFullDateArray,
}
