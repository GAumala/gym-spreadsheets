const calendar = require('./calendar.js');
const { trainingHours } = require('./constants.js');

const { 
  getDayShortName,
} = require('./dateFormatters.js');

const leftPadUnits = u => {
  if (u < 10) return '0' + u; 
  return '' + u;
}

const compareTimeSlots = (a, b) => {
  if (a.dia < b.dia)
    return -1;

  if (a.dia > b.dia)
    return 1;

  if (a.hora < b.hora) 
    return -1;

  if (a.hora > b.hora) 
    return 1;

  return 0;
}

const createMonthSlots = (year, month) => {
  const slots = [];
  const totalDays = calendar.getNumberOfDaysInMonth(year, month);
  const firstWeekDay = calendar.getFirstDayOfMonth(year, month);

  for (let i = 0; i < totalDays; i++) {
    const dayNumber = i + 1;
    const weekDay = (firstWeekDay + i) % 7;
    const dia = `${leftPadUnits(dayNumber)}-${getDayShortName(weekDay)}`;
    if (weekDay !== 0)
      slots.push(...trainingHours.map(hora => ({hora, dia})))
  }

  return slots;
}

const createFutureSlotsAtHour = (dateArray, specifiedHour) => {
  const [year, month, date] = dateArray;
  const slots = [];
  const totalDays = calendar.getNumberOfDaysInMonth(year, month);
  const firstWeekDay = calendar.getFirstDayOfMonth(year, month);
  const dateAsSlot = convertDateToSlot(...dateArray)

  for (let i = 0; i < totalDays; i++) {
    const dayNumber = i + 1;
    const weekDay = (firstWeekDay + i) % 7;
    const dia = `${leftPadUnits(dayNumber)}-${getDayShortName(weekDay)}`;
    const newSlot = { dia, hora: specifiedHour }
    if (compareTimeSlots(dateAsSlot, newSlot) === -1 && weekDay !== 0)
      slots.push(newSlot);
  }

  return slots;
}

const convertDateToSlot = (year, month, date, hour, minutes) => {
  const firstWeekDay = calendar.getFirstDayOfMonth(year, month);
  const weekDay = (firstWeekDay + date - 1) % 7;

  const dia = `${leftPadUnits(date)}-${getDayShortName(weekDay)}`;
  const hora = `${leftPadUnits(hour)}:${leftPadUnits(minutes)}`

  return { dia, hora };
}

const breakTimeSlotsWithDate = (slots, dateArray) => {
  if (slots.length === 0)
    return { past: [], future: [] }

  const dateAsSlot = convertDateToSlot(...dateArray)
  
  const firstSlot = slots[0];
  const lastSlot = slots[slots.length - 1];

  const isBeforeFirstSlot = 
    compareTimeSlots(dateAsSlot, firstSlot) === -1;

  if (slots.length === 1) 
    return isBeforeFirstSlot 
      ? {past: [], future: slots} 
      : {past: slots, future: []};

  if (isBeforeFirstSlot)
    return {past: [], future: slots}

  for (let i = 0; i < slots.length - 1; i++) {
    const currentSlot = slots[i];
    const nextSlot = slots[i + 1];

  const isAfterCurrentSlot = 
    compareTimeSlots(dateAsSlot, currentSlot) > -1;

  const isBeforeNextSlot = 
    compareTimeSlots(dateAsSlot, nextSlot) === -1;

    if (isAfterCurrentSlot && isBeforeNextSlot)
      return {
        past: slots.slice(0, i + 1),
        future: slots.slice(i + 1) 
      };
  }

  return {past: slots, future: []};
}

module.exports = {
  breakTimeSlotsWithDate,
  compareTimeSlots,
  convertDateToSlot,
  createFutureSlotsAtHour,
  createMonthSlots,
};
