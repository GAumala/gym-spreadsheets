const calendar = require("./calendar.js");
const { trainingHours } = require("./constants.js");

const { getDayShortName } = require("./dateFormatters.js");

const leftPadUnits = (u) => {
  if (u < 10) return "0" + u;
  return "" + u;
};

const compareTimeSlots = (a, b) => {
  if (a.dia < b.dia) return -1;

  if (a.dia > b.dia) return 1;

  if (a.hora < b.hora) return -1;

  if (a.hora > b.hora) return 1;

  return 0;
};

/**
 * Receives year, month, day and returns a string to identify the day in
 * a time slot.
 * example: f(2020, 12, 23) = '23-Mié';
 */
const formatDayForTimeSlot = (year, month, dayNumber) => {
  const firstWeekDay = calendar.getFirstDayOfMonth(year, month);
  const weekDay = (dayNumber + firstWeekDay - 1) % 7;
  return `${leftPadUnits(dayNumber)}-${getDayShortName(weekDay)}`;
};

const createMonthSlots = (year, month) => {
  const slots = [];
  const totalDays = calendar.getNumberOfDaysInMonth(year, month);
  const firstWeekDay = calendar.getFirstDayOfMonth(year, month);

  for (let i = 0; i < totalDays; i++) {
    const dayNumber = i + 1;
    const weekDay = (firstWeekDay + i) % 7;
    const dia = `${leftPadUnits(dayNumber)}-${getDayShortName(weekDay)}`;
    if (weekDay !== 0)
      slots.push(...trainingHours.map((hora) => ({ hora, dia })));
  }

  return slots;
};

const createFutureSlotsAtHour = (dateArray, specifiedHour) => {
  const [year, month] = dateArray;
  const slots = [];
  const totalDays = calendar.getNumberOfDaysInMonth(year, month);
  const firstWeekDay = calendar.getFirstDayOfMonth(year, month);
  const dateAsSlot = convertDateToSlot(...dateArray);

  for (let i = 0; i < totalDays; i++) {
    const dayNumber = i + 1;
    const weekDay = (firstWeekDay + i) % 7;
    const dia = `${leftPadUnits(dayNumber)}-${getDayShortName(weekDay)}`;
    const newSlot = { dia, hora: specifiedHour };
    if (compareTimeSlots(dateAsSlot, newSlot) === -1 && weekDay !== 0)
      slots.push(newSlot);
  }

  return slots;
};

const convertDateToSlot = (year, month, date, hour, minutes) => {
  const firstWeekDay = calendar.getFirstDayOfMonth(year, month);
  const weekDay = (firstWeekDay + date - 1) % 7;

  const dia = `${leftPadUnits(date)}-${getDayShortName(weekDay)}`;
  const hora = `${leftPadUnits(hour)}:${leftPadUnits(minutes)}`;

  return { dia, hora };
};

/**
 * Returns an object with two arrays: `past` and `future`.
 * The former contains slots in the past of the specified
 * date, while the latter contains slots in the future OR
 * present.
 */
const breakTimeSlotsWithDate = (slots, dateArray) => {
  if (slots.length === 0) return { past: [], future: [] };

  const dateAsSlot = convertDateToSlot(...dateArray);
  const firstSlot = slots[0];

  const isBeforeFirstSlot = compareTimeSlots(dateAsSlot, firstSlot) !== 1;

  if (isBeforeFirstSlot) return { past: [], future: slots };

  if (slots.length === 1)
    // time is after first slot
    return { past: slots, future: [] };

  for (let i = 0; i < slots.length - 1; i++) {
    const currentSlot = slots[i];
    const nextSlot = slots[i + 1];

    const isAfterCurrentSlot = compareTimeSlots(dateAsSlot, currentSlot) === 1;

    const isBeforeOrEqualToNextSlot =
      compareTimeSlots(dateAsSlot, nextSlot) < 1;

    if (isAfterCurrentSlot && isBeforeOrEqualToNextSlot)
      return {
        past: slots.slice(0, i + 1),
        future: slots.slice(i + 1),
      };
  }

  return { past: slots, future: [] };
};

/**
 * The input array in these functions contains numbers
 * followed by a training hour.
 * Something like: [ 1, 3, 5, '08:00', 2, '17:00' ]
 */
const isCLTimeSlotsArrayValid = (inputArray) => {
  const length = inputArray.length;
  if (length === 0) return true;

  if (typeof inputArray[0] === "string") return false;
  if (typeof inputArray[length - 1] !== "string") return false;

  for (let i = 1; i < length - 1; i++) {
    const current = inputArray[i];
    const previous = inputArray[i - 1];

    if (typeof current === "string" && typeof previous !== "number")
      return false;
  }

  return true;
};

/* CLTimeSlots means "Command Line Time Slots", that is time slots that were
 * input via a command line, the difference with the "normal" time slots is
 * that these ones instead of a string attribute "dia", they have a number
 * attribute "diaInt".
 * The input array argument is an arraya with user input for the time slots.
 * The items of this array may be a number representing a day of the month,
 * or a string with a training hour.
 * Returns null if the input array is invalid.
 * You can avoid this case by checking with
 * isCLTimeSlotsArrayValid() beforhand.
 */
const foldCLTimeSlotsArray = (inputArray) => {
  const dayNumbers = [];
  const timeSlots = inputArray.reduce((output, item) => {
    if (output == null) return;

    if (typeof item === "number") {
      dayNumbers.push(item);
      return output;
    }

    if (typeof item === "string") {
      if (dayNumbers.length === 0) return null;
      const slots = dayNumbers.map((diaInt) => {
        return { diaInt, hora: item };
      });
      dayNumbers.splice(0, dayNumbers.length);
      output.push(...slots);
      return output;
    }
  }, []);

  if (dayNumbers.length > 0) return null;

  return timeSlots;
};

/**
 * Converts a CLTimeSlot to a regular time slot
 * using the supplied date array to get the time slot's month.
 */
const upgradeCLTimeSlot = (dateArray, clTimeSlot) => {
  const [year, month] = dateArray;
  const { diaInt, hora } = clTimeSlot;
  const dia = formatDayForTimeSlot(year, month, diaInt);
  return { dia, hora };
};

module.exports = {
  breakTimeSlotsWithDate,
  compareTimeSlots,
  convertDateToSlot,
  createFutureSlotsAtHour,
  createMonthSlots,
  foldCLTimeSlotsArray,
  formatDayForTimeSlot,
  isCLTimeSlotsArrayValid,
  upgradeCLTimeSlot,
};
