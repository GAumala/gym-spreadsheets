const calendar = require('./lib/calendar.js');
const { trainingHours } = require('./lib/constants.js');
const { getDayShortName } = require('./lib/dateFormatters.js');
const normalizeString = require('normalize-for-search');

const createUserID = (name, suffix = "") => 
  normalizeString(name.trim()
                      .replace('ñ', 'n'))
    .replace(/\s{1,}/g, "_")
    .replace(/[^a-z_]/g, '') + suffix;

const setMissingUserIDs = rows => {
  const knownIds = new Set();
  let missingIds = false;
  rows.forEach((user, index) => {
    const { id, nombre } = user;
    if (id)
      knownIds.add(id);
    else
      missingIds = true;
  });

  if (!missingIds)
    return rows;

  return rows.map(user => {
    if (user.id)
      return user;

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

const leftPadDay = day => {
  if (day < 10) return '0' + day; 
  return '' + day;
}

const createMonthSlots = (year, month) => {
  const slots = [];
  const totalDays = calendar.getNumberOfDaysInMonth(year, month);
  const firstWeekDay = calendar.getFirstDayOfMonth(year, month);

  for (let i = 0; i < totalDays; i++) {
    const dayNumber = i + 1;
    const weekDay = (firstWeekDay + i) % 7;
    const dia = `${leftPadDay(dayNumber)}-${getDayShortName(weekDay)}`;
    if (weekDay !== 0)
      slots.push(...trainingHours.map(hora => ({hora, dia})))
  }

  return slots;
}
  

module.exports = {
  createMonthSlots,
  createUserID,
  setMissingUserIDs
}
