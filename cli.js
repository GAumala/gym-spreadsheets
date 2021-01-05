#!/usr/bin/env node

const dbConnection = require('./src/db.js')
const createSheetsAPI = require('./src/sheets-client.js');
const clock = require('./src/clock.js')
const db = require('./src/db/queries.js')
const SheetsAdmin = require('./src/SheetsAdmin.js'); 
const BackupUtility = require('./src/BackupUtility.js'); 
const storage = require('./src/lib/json-file-storage.js');
const { CacheReader } = require('./src/cache.js'); 

const runCLIProgram = (make, exec) => {
  // remove the executable file and the script file
  
  exec(make())
    .then(res => {
      const message = res.message || 'Success!';
      console.log(message);
    })
    .catch(e => {
      if (e === undefined)
        console.log('Undefined error thrown');
      if (e.isCustom)
        console.log(e.message);
      else
        console.log(e);
      })
    .finally(() => dbConnection.destroy());
};

const runSheetsAdminProgram = exec => runCLIProgram(() => {
  const args = process.argv.slice(2);
  const sheetsAPI = createSheetsAPI(args);
  return new SheetsAdmin({ sheetsAPI, db, clock });
}, exec)

const runBackupProgram = exec => runCLIProgram(() => {
  const args = process.argv.slice(2);
  const sheetsAPI = createSheetsAPI(args);
  const cache = new CacheReader({ storage });
  return new BackupUtility({ sheetsAPI, db, clock, cache });
}, exec)

const handleReservationsCommand = argv => 
  runSheetsAdminProgram(admin => {
    switch (argv.operation) {
      case "add":
        return admin.changeReservationHourForADay(argv);
      case "list":
        return admin.listMembersThatReservedAtTime(argv);
      case "create-sheet":
        return admin.createTimeTableSheet(argv);
      default:
        return Promise.reject({ 
          isCustom: true, 
          message: 'Unknown operation: ' + argv.operation 
        });
    }
  });

const handleMembersCommand = argv => 
  runSheetsAdminProgram(admin => {
    switch (argv.operation) {
      case "add":
        return admin.addNewMember(argv);
      case "set-ids":
        return admin.setMissingUserIDs(argv);
      default:
        return Promise.reject({ 
          isCustom: true, 
          message: 'Unknown operation: ' + argv.operation 
        });
    }
  });

const handleHistoryCommand = argv => 
  runBackupProgram(backup => {
    switch (argv.operation) {
      case "list":
        return backup.listHistory();
      case "undo":
        return backup.undo(argv);
      default:
        return Promise.reject({ 
          isCustom: true, 
          message: 'Unknown operation: ' + argv.operation 
        });
    }
  });

const buildReservationsCommand = yargs => yargs
  .option('day', {
    alias: [ 'days' ],
    describe: 'an integer (1-31) with a FUTURE day of the month'
  })
  .option('hour', {
    alias: [ 'hours' ],
    describe: 'A string with a FUTURE hour in the format hh:mm (24 hrs.)'
  })
  .option('member', {
    describe: 'A string with a  member ID'
  })
  .option('this-month', {
    describe: 'Use this month instead of next relative to system time',
    boolean: true
  })
  .implies('day', 'hour')
  .example('$0 reservations add --member carlos_sanchez --day 25 --hour 06:00', 'adds a reservation for member with ID "carlos_sanchez" on the 25th at 6:00')
  .example('$0 reservations list', 'prints members that have a reservation for the next training hour relative to system time')
  .example('$0 reservations list --hour 18:00', 'prints members that have a reservation for today at 18:00')
  .example('$0 reservations list --day 25 --hour 18:00', 'prints members that have a reservation for the 25th at 18:00')
  .example('$0 reservations create-sheet', 'creates the reservation sheet for next month relative to system time')
  .example('$0 reservations create-sheet --this-month', 'creates the reservation sheet for this month relative to system time');

const buildMembersCommand = yargs => yargs
  .option('hour', {
    alias: [ 'hours' ],
    describe: 'A string with an hour in the format hh:mm (24 hrs.)'
  })
  .option('name', {
    describe: "A string a member's name"
  })
  .option('id', {
    describe: "A string a member's id"
  })
  .example('$0 members add --name "Carlos Sánchez" --hour 18:00', 'Adds a new member "Carlos Sánchez" with training hour 18:00 and a generated id')
  .example('$0 members add --id carlos_sanchez1 --name "Carlos Sánchez" --hour 18:00', 'Adds a new member "Carlos Sánchez" with training hour 18:00 and id "carlos_sanchez1"')
  .example('$0 members set-ids', 'Sets missing user IDs in the members sheet')

const buildHistoryCommand = yargs => yargs
  .option('hash', {
    describe: "A hash string that identifies a history entry"
  })
  .example('$0 history list', 'List past operations')
  .example('$0 history undo --hash  da25eff45c', 'Undo operation with hash da25eff45c')

require('yargs') 
  .command(
    'reservations <operation>',
    'Manage the reservations document. Please note that you can only read and write reservations in the future.',
    buildReservationsCommand,
    handleReservationsCommand)
  .command(
    'members <operation>',
    'Manage the members sheet',
    buildMembersCommand,
    handleMembersCommand)
  .command(
    'history <operation>',
    'browse the operation history and undo specific operations',
    buildHistoryCommand,
    handleHistoryCommand)
  .help()
  .argv
