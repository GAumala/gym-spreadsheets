const normalizeString = require('normalize-for-search');

const createUserId = (name, suffix = "") => 
  normalizeString(name.trim()
                      .replace('ñ', 'n'))
    .replace(/\s{1,}/g, "_")
    .replace(/[^a-z_]/g, '') + suffix;

const setMissingUserIds = rows => {
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

    let newId = createUserId(user.nombre);
    let attempts = 0;
    while (knownIds.has(newId)) {
      attempts += 1;
      newId = createUserId(user.nombre, attempts);
    }
    knownIds.add(newId);
    return { ...user, id: newId };
  });
};
  

module.exports = {
  createUserId,
  setMissingUserIds
}
