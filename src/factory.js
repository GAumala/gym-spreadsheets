const clock = require("./clock.js");
const db = require("./db/queries.js");
const cliReporter = require("./reporter/cli-reporter.js");
const PromiseReporter = require("./reporter/PromiseReporter.js");
const methods = require("./sheets/methods.js");
const storage = require("./lib/json-file-storage.js");
const { CacheReader, CacheWriter } = require("./cache.js");
const SheetsAdmin = require("./SheetsAdmin.js");
const BackupUtility = require("./BackupUtility.js");

const createSheetsAPI = (cacheWriter) => {
  if (!cacheWriter) return methods;

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
      await cacheWriter.writeMembersSheet(res);
      return res;
    },
    loadReservations: async (sheetTitle) => {
      const res = await loadReservations(sheetTitle);
      await cacheWriter.writeReservationsSheet({ ...res, sheetTitle });
      return res;
    },
    createTimeTableSheet: async (sheetTitle) => {
      const res = await createTimeTableSheet(sheetTitle);
      await cacheWriter.writeNewTimeTableSheetTitle({ sheetTitle });
      return res;
    },
  };
};

const createSheetsAdmin = () => {
  const args = process.argv.slice(2);
  const systemTime = Date.now();
  const cache = new CacheWriter({ storage, systemTime, args });
  const reporter = new PromiseReporter(cliReporter);
  const sheetsAPI = createSheetsAPI(cache);
  return new SheetsAdmin({ sheetsAPI, db, clock, reporter });
};

const createBackupUtility = () => {
  const sheetsAPI = createSheetsAPI();
  const cache = new CacheReader({ storage });
  const reporter = new PromiseReporter(cliReporter);
  return new BackupUtility({ sheetsAPI, db, clock, cache, reporter });
};

/**
 * This module exposes methods to create SheetAdmin and BackupUtility instances
 * with all the dependencies needed for them to work in the CLI.
 */
module.exports = {
  createBackupUtility,
  createSheetsAdmin,
};
