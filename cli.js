#!/usr/bin/env node

const dbConnection = require('./src/db.js')
const sheetsAPI = require('./src/sheets.js')
const clock = require('./src/clock.js')
const db = require('./src/db/queries.js')
const SheetsAdmin = require('./src/SheetsAdmin.js'); 
const admin = new SheetsAdmin({ sheetsAPI, db, clock });

const reservationSheetNames = ['reservation', 'reservations']
const memberSheetNames = ['member', 'members']

const runCLIProgram = fn => {
  fn()
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
}

require('yargs') 
  .command(
    'reservations <operation>',
    'Manage the reservations document. Please note that you can only read and write reservations in the future.',
    yargs => yargs
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
      .implies('day', 'hour')
      .example('$0 reservations list', 'prints members that have a reservation for the next training hour relative to system time')
      .example('$0 reservations list --hour 18:00', 'prints members that have a reservation for today at 18:00')
      .example('$0 reservations list --day 25 --hour 18:00', 'prints members that have a reservation for the 25th at 18:00')
      .example('$0 reservations create-sheet', 'creates the reservation sheet for next month relative to system time'),
    argv => 
      runCLIProgram(() => {
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
      }))
  
  .help()
  .argv
