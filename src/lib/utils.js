const leftPadUnits = (u) => {
  if (u < 10) return "0" + u;
  return "" + u;
};

module.exports = {
  leftPadUnits,
};
