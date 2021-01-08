const getMonthLongName = (month) => {
  switch (month) {
    case 1:
      return "Enero";
    case 2:
      return "Febrero";
    case 3:
      return "Marzo";
    case 4:
      return "Abril";
    case 5:
      return "Mayo";
    case 6:
      return "Junio";
    case 7:
      return "Julio";
    case 8:
      return "Agosto";
    case 9:
      return "Septiembre";
    case 10:
      return "Octubre";
    case 11:
      return "Noviembre";
    case 12:
      return "Diciembre";
  }
};

const getMonthShortName = (month) => {
  const longName = getMonthLongName(month);
  return longName ? longName.substring(0, 3) : longName;
};

const getDayLongName = (day) => {
  switch (day) {
    case 0:
      return "Domingo";
    case 1:
      return "Lunes";
    case 2:
      return "Martes";
    case 3:
      return "Miércoles";
    case 4:
      return "Jueves";
    case 5:
      return "Viernes";
    case 6:
      return "Sábado";
  }
};

const getDayShortName = (day) => {
  const longName = getDayLongName(day);
  return longName ? longName.substring(0, 3) : longName;
};

const getReadableDateTime = (timestamp) => {
  const date = new Date(timestamp);

  const month = getMonthShortName(date.getMonth() + 1);
  const monthDay = date.getDate();
  const hour = date.getHours();
  const hourString = hour < 10 ? "0" + hour : hour;
  const minute = date.getMinutes();
  const minuteString = minute < 10 ? "0" + minute : minute;

  return `${month} ${monthDay} ${hourString}:${minuteString}`;
};

module.exports = {
  getDayLongName,
  getDayShortName,
  getMonthLongName,
  getMonthShortName,
  getReadableDateTime,
};
