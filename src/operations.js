const lib = require('./lib.js')

/**
 * Revisa el spreadsheet de los miembros y actualiza las generando un id a las 
 * filas que no contengan uno.
 *
 * deps:
 * - loadMemberIDRows: funcion para cargar las filas de miembros desde el 
 *   spreadsheet. debe de contener los miembros sanitizados en 'data' 
 *   y la funcion 'reconciliateFn' para hacer el update.
 */
const setMissingUserIds = async (deps) => {
  const membersSheet = await deps.loadMemberIDRows();
  if (membersSheet.error)
    throw membersSheet.error;

  const original = membersSheet.data;
  const updated = lib.setMissingUserIds(original);

  return membersSheet.reconciliateFn(updated);
}

module.exports = { setMissingUserIds };
