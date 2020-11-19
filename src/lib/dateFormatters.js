
const getMonthShortName = month => {
  switch (month) {
    case 1: return 'Ene';
    case 2: return 'Feb';
    case 3: return 'Mar';
    case 4: return 'Abr';
    case 5: return 'May';
    case 6: return 'Jun';
    case 7: return 'Jul';
    case 8: return 'Ago';
    case 9: return 'Sep';
    case 10: return 'Oct';
    case 11: return 'Nov';
    case 12: return 'Dec';
  }
}

const getDayShortName = day => {
  switch (day) {
    case 0: return 'Dom';
    case 1: return 'Lun';
    case 2: return 'Mar';
    case 3: return 'Mié';
    case 4: return 'Jue';
    case 5: return 'Vie';
    case 6: return 'Sáb';
  }
}

module.exports = {
  getDayShortName,
  getMonthShortName
}
