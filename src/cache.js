const path = require('path');
const hash = require('rev-hash')

const { cacheMetadataSchema } = require('./schemas.js');
const { compliesWithSchema } = require('./boundary.js');

const storageDir = path.join(__dirname, '..', '.cache');

class CacheWriter {
  constructor({ storage, systemTime, args }) {
    this.storage = storage;
    this.key = hash('' + systemTime);
    this.systemTime = systemTime;
    this.args = args;
  }

  writeMetadata () {
    const fileName = 'metadata.json';
    const type = 'metadata';
    const { args, key, systemTime } = this;
    const value = { args, systemTime, type };

    return this.storage.write({ storageDir, key, fileName, value });
  }


  writeMembersSheet({ headerValues, data }) {
    const { key } = this;
    const type = 'members';
    const value = { headerValues, data, type };
    const fileName = 'members.json';

    const metadataPromise = this.writeMetadata();
    const sheetPromise =  
      this.storage.write({ storageDir, key, fileName, value });

    return Promise.all([metadataPromise, sheetPromise]);
  }

  writeReservationsSheet({ headerValues, data, sheetTitle }) {
    const { key } = this;
    const type = 'reservations';
    const value = { headerValues, data, type, sheetTitle };
    const fileName = `reservations-${sheetTitle}.json`;

    const metadataPromise = this.writeMetadata();
    const sheetPromise =  
      this.storage.write({ storageDir, key, fileName, value });

    return Promise.all([metadataPromise, sheetPromise]);
  }

  writeNewTimeTableSheetTitle({ sheetTitle }) {
    const { key } = this;
    const type = 'new-timetable';
    const value = { type, sheetTitle };
    const fileName = `new-timetable-${sheetTitle}.json`;

    const metadataPromise = this.writeMetadata();
    const sheetPromise =  
      this.storage.write({ storageDir, key, fileName, value });

    return Promise.all([metadataPromise, sheetPromise]);
  }
}

/* history utilities */ 
const isValidMetadata = input => 
  compliesWithSchema({
    schema: cacheMetadataSchema, 
    input: {
      args: input.args,
      systemTime: input.systemTime,
      type: input.type
    }
  });

const compareMetadata = (a, b) => {
  if (a.systemTime < b.systemTime)
    return -1;
  if (a.systemTime > b.systemTime)
    return 1;
  return 0
}

class CacheReader {
  constructor({ storage }) {
    this.storage = storage;
  }

  findFilesByKey(key)  {
    return this.storage.readAll({ storageDir, key });
  }

  async listHistory() {
    const { storage } = this;
    const cacheKeys = await storage.listKeys({ storageDir });
    const entries = await Promise.all(cacheKeys.map(key => 
      storage.read({ storageDir, key, fileName: 'metadata.json' })));

    const createHistoryItem = (item, i) => 
      ({ ...item, key: cacheKeys[i] });

    return entries
      .filter(isValidMetadata)
      .sort(compareMetadata)
      .map(createHistoryItem);
  }
}

module.exports = { CacheWriter, CacheReader };
