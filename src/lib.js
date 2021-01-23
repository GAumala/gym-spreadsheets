const { getMonthShortName } = require("./lib/dateFormatters.js");
const normalizeString = require("normalize-for-search");
const {
  formatDayForTimeSlot,
  foldCLTimeSlotsArray,
  isCLTimeSlotsArrayValid,
  upgradeCLTimeSlot,
} = require("./lib/timeSlot.js");
const { FatalError } = require("./errors.js");
const { moveDateArrayToNextMonthStart } = require("./lib/dateArray.js");
const createUserID = (name, suffix = "") =>
  normalizeString(name.trim().replace("ñ", "n"))
    .replace(/\s{1,}/g, "_")
    .replace(/[^a-z_]/g, "") + suffix;

const setMissingUserIDs = (rows) => {
  const knownIds = new Set();
  let missingIds = false;
  rows.forEach((user) => {
    const { id } = user;
    if (id) knownIds.add(id);
    else missingIds = true;
  });

  if (!missingIds) return rows;

  return rows.map((user) => {
    if (user.id) return user;

    let newId = createUserID(user.nombre);
    let attempts = 0;
    while (knownIds.has(newId)) {
      attempts += 1;
      newId = createUserID(user.nombre, attempts);
    }
    knownIds.add(newId);
    return { ...user, id: newId };
  });
};

const getTimetableSheetName = (year, month) =>
  `${getMonthShortName(month)}-${year}`.toUpperCase();

const formatDayWithDateArray = (dateArray, day) => {
  const [year, month] = dateArray;
  return formatDayForTimeSlot(year, month, day);
};
/**
 * Recieves a a date array with today's start and a reservation changes
 * object and returns the reservation changes for this month and the
 * next one.
 */
const getRearrangementsByMonth = (todayDateArray, changes) => {
  const [, , /*year*/ /*month*/ today] = todayDateArray;
  const nextMonthDateArray = moveDateArrayToNextMonthStart(todayDateArray);

  const { member, addDays, removeDays } = changes;
  if (!isCLTimeSlotsArrayValid(addDays))
    throw new FatalError("INVALID_TIME_SLOTS_INPUT_ARRAY", { value: addDays });

  const slotsToAdd = foldCLTimeSlotsArray(addDays);

  const daysToRearrange = addDays
    .filter((i) => typeof i === "number")
    .concat(removeDays)
    .sort((x, y) => x - y);

  const isEmpty = daysToRearrange.length === 0;

  return {
    isEmpty,
    thisMonth: {
      member,
      slotsToAdd: slotsToAdd
        .filter((slot) => slot.diaInt >= today)
        .map((x) => upgradeCLTimeSlot(todayDateArray, x)),
      daysToRearrange: daysToRearrange
        .filter((day) => day >= today)
        .map((day) => formatDayWithDateArray(todayDateArray, day)),
    },
    nextMonth: {
      member,
      slotsToAdd: slotsToAdd
        .filter((slot) => slot.diaInt < today)
        .map((x) => upgradeCLTimeSlot(nextMonthDateArray, x)),
      daysToRearrange: daysToRearrange
        .filter((day) => day < today)
        .map((day) => formatDayWithDateArray(nextMonthDateArray, day)),
    },
  };
};

module.exports = {
  createUserID,
  getTimetableSheetName,
  getRearrangementsByMonth,
  setMissingUserIDs,
};
