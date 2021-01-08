const { leftPadUnits } = require("./utils.js");

const parseHour = (time) => {
  const [hourString, minuteString] = time.split(":");
  return [parseInt(hourString), parseInt(minuteString)];
};

const formatHour = (hour, minutes) => {
  return `${leftPadUnits(hour)}:${leftPadUnits(minutes)}`;
};

module.exports = {
  formatHour,
  parseHour,
};
