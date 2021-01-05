const methods = require('./sheets/methods.js');
const storage = require('./lib/json-file-storage.js');
const { CacheWriter } = require('./cache.js');

module.exports = (args) => {
  const systemTime = Date.now();
  const cache = new CacheWriter({ storage, systemTime, args })
  const {
    createTimeTableSheet,
    loadMembers,
    loadReservations,
    ...extraMethods
  } = methods;
  return {
    ...extraMethods,
    loadMembers: async () => {
      const res = await loadMembers();
      await cache.writeMembersSheet(res);
      return res;
    },
    loadReservations: async (sheetTitle) => {
      const res = await loadReservations(sheetTitle);
      await cache.writeReservationsSheet({ ...res, sheetTitle });
      return res;
    },
    createTimeTableSheet: async (sheetTitle) => {
      const res = await createTimeTableSheet(sheetTitle);
      await cache.writeNewTimeTableSheetTitle({ sheetTitle });
      return res;
    }
  }
}; 
