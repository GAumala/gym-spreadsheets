const { getMonthShortName } = require("./lib/dateFormatters.js");
const normalizeString = require("normalize-for-search");

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

module.exports = {
  createUserID,
  getTimetableSheetName,
  setMissingUserIDs,
};
