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

module.exports = {
  getYearAndMonth,
  getYearAndNextMonth, 
}
