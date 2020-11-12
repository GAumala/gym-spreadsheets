const lib = require('./lib.js')

/**
 * Revisa el spreadsheet de los miembros y actualiza las generando un id a las 
 * filas que no contengan uno.
 *
 * deps:
 * - loadMemberIDs: funcion para cargar las filas de miembros desde el 
 *   spreadsheet (sheet.js). debe de contener un array de los miembros 
 *   sanitizados en 'data' y la funcion 'reconciliateFn' para hacer 
 *   el update.
 */
const setMissingUserIDs = async (deps) => {
  const membersSheet = await deps.loadMemberIDs();

  const original = membersSheet.data;
  const updated = lib.setMissingUserIDs(original);

  return membersSheet.reconciliateFn(updated);
}

module.exports = { setMissingUserIDs };
