const boundary = require("./boundary.js");
const { getReadableDateTime } = require("./lib/dateFormatters.js");
const { FatalError } = require("./errors.js");
const {
  memberArraySchema,
  timeSlotArraySchema,
  sheetTitleSchema,
} = require("./schemas.js");

const printHistoryItemLine = (item) => {
  const { key, systemTime } = item;
  const date = getReadableDateTime(systemTime);
  const args = item.args.join(" ");
  return [key, date, args].join("\t");
};

const assertDataNotCorrupted = (type, schema, input) => {
  if (!boundary.compliesWithSchema({ schema, input }))
    throw new FatalError("HISTORY_FILE_CORRUPTED", { type });
};

const validateHistoryFile = (file) => {
  switch (file.type) {
    case "members": {
      const { data, type } = file;
      assertDataNotCorrupted(type, memberArraySchema, data);
      break;
    }

    case "reservations": {
      const { data, type, sheetTitle } = file;
      assertDataNotCorrupted(type, timeSlotArraySchema, data);
      assertDataNotCorrupted(type, sheetTitleSchema, { sheetTitle });
      break;
    }

    case "new-timetable": {
      const { type, sheetTitle } = file;
      assertDataNotCorrupted(type, sheetTitleSchema, { sheetTitle });
      break;
    }
  }
};

const undoWithFile = async (utility, file) => {
  const { sheetsAPI, reporter } = utility;

  switch (file.type) {
    case "metadata":
      return;

    case "members": {
      const { reconciliateFn } = await reporter
        .report("Cargando miembros")
        .whileDoing(sheetsAPI.loadMembers());

      return reporter
        .report("Restableciendo miembros")
        .whileDoing(reconciliateFn(file.data));
    }

    case "reservations": {
      const { sheetTitle, data } = file;

      const loadRes = await reporter
        .report(`Cargando resrvaciones ${sheetTitle}`)
        .whileDoing(sheetsAPI.loadReservations(sheetTitle));

      if (!loadRes.err) {
        const { reconciliateFn } = loadRes;

        return reporter
          .report(`Restableciendo resrvaciones ${sheetTitle}`)
          .whileDoing(reconciliateFn(data));
      } else if (loadRes.err === "SHEET_NOT_FOUND") {
        const createSheetWithNewData = sheetsAPI
          .createTimeTableSheet(sheetTitle)
          .then(({ reconciliateFn }) => reconciliateFn(data));

        return reporter
          .report(`Restableciendo reservaciones ${sheetTitle}`)
          .whileDoing(createSheetWithNewData);
      }

      throw loadRes.err;
    }

    case "new-timetable": {
      const { sheetTitle } = file;
      return reporter
        .report(`Borrando hoja de reservaciones ${sheetTitle}`)
        .whileDoing(sheetsAPI.deleteTimeTableSheet(sheetTitle));
    }
  }
};

class BackupUtility {
  constructor({ sheetsAPI, cache, reporter }) {
    this.sheetsAPI = sheetsAPI;
    this.cache = cache;
    this.reporter = reporter;
  }

  /**
   * Lists past operations in a human readable way.
   */
  async listHistory() {
    const { cache } = this;
    const historyItems = await cache.listHistory();
    const lines = historyItems.map(printHistoryItemLine);
    return { message: lines.join("\n") };
  }

  async undo(args) {
    const { cache } = this;
    const { data: keyData } = boundary.getHashFromUserInput(args);
    const { hash } = keyData;

    const files = await cache.findFilesByKey(hash);
    if (files.length === 0) throw new FatalError("HASH_NOT_FOUND", { hash });

    files.forEach(validateHistoryFile);

    const promises = files.map((f) => undoWithFile(this, f));
    await Promise.all(promises);

    return {};
  }
}

module.exports = BackupUtility;
