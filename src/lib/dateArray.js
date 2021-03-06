const { parseHour, formatHour } = require("./hour.js");
const calendar = require("./calendar.js");
const { trainingHours } = require("./constants.js");
const { getMonthLongName, getDayLongName } = require("./dateFormatters.js");

const moveDateArrayToNextMonthStart = (dateArray) => {
  const [year, month] = dateArray;
  return [...calendar.getNextMonth(year, month), 1, 0, 0];
};

/**
 * Moves the date array to the next training hour.
 * If the array's hour and minute already match a training hour,
 * an equal array is returned (no movement).
 */
const moveDateArrayToNextTrainingHour = (dateArray) => {
  const [year, month, day, hour, minute] = dateArray;

  const isGymOpen = calendar.getWeekDay(...dateArray) !== 0;
  if (isGymOpen)
    for (let i = 0; i < trainingHours.length; i++) {
      const [tHour, tMinute] = parseHour(trainingHours[i]);
      if (hour < tHour || (hour === tHour && minute <= tMinute))
        return [year, month, day, tHour, tMinute];
    }

  const nextDay = day + 1;
  const lastMonthDay = calendar.getNumberOfDaysInMonth(year, month);
  const tomorrowDateArray =
    nextDay > lastMonthDay
      ? moveDateArrayToNextMonthStart(dateArray)
      : [year, month, nextDay, 0, 0];

  return moveDateArrayToNextTrainingHour(tomorrowDateArray);
};

const moveDateArrayToFutureDay = (dateArray, targetDay) => {
  const [year, month] =
    targetDay < dateArray[2]
      ? moveDateArrayToNextMonthStart(dateArray)
      : dateArray;
  const lastMonthDay = calendar.getNumberOfDaysInMonth(year, month);
  return [
    year,
    month,
    Math.min(lastMonthDay, targetDay),
    dateArray[3],
    dateArray[4],
  ];
};

const moveDateArrayToMinuteEarlier = (dateArray) => {
  const [year, month, day, hour, minute] = dateArray;

  if (minute > 0) return [year, month, day, hour, minute - 1];

  const newMinute = 59;
  if (hour > 0) return [year, month, day, hour - 1, newMinute];

  const newHour = 23;
  if (day > 1) return [year, month, day - 1, newHour, newMinute];

  if (month > 1) {
    const newDay = calendar.getNumberOfDaysInMonth(year, month - 1);
    return [year, month - 1, newDay, newHour, newMinute];
  } else {
    const newMonth = 12;
    const newDay = calendar.getNumberOfDaysInMonth(year - 1, newMonth);
    return [year - 1, newMonth, newDay, newHour, newMinute];
  }
};

/**
 * Change the array's hour and minutes.
 * The timeString argument is meant to be in format hh:mm
 */
const changeDateArrayHourAndMinutes = (dateArray, timeString) => {
  const [year, month, day] = dateArray;
  const [specifiedHour, specifiedMinute] = parseHour(timeString);
  return [year, month, day, specifiedHour, specifiedMinute];
};

const moveDateArrayToTodaysDawn = (dateArray) => {
  const [year, month, day] = dateArray;
  return [year, month, day, 0, 0];
};

const dateArrayToReadableString = (dateArray) => {
  const [, month, day, hour, minute] = dateArray;
  const readableMonth = getMonthLongName(month);
  const readableWeekDay = getDayLongName(calendar.getWeekDay(...dateArray));
  const readableHour = formatHour(hour, minute);
  return `${readableWeekDay}, ${day} de ${readableMonth} ${readableHour}`;
};

module.exports = {
  changeDateArrayHourAndMinutes,
  dateArrayToReadableString,
  moveDateArrayToFutureDay,
  moveDateArrayToMinuteEarlier,
  moveDateArrayToNextMonthStart,
  moveDateArrayToNextTrainingHour,
  moveDateArrayToTodaysDawn,
};
