#!/usr/bin/env node

const dbConnection = require('./src/db.js')
const sheetsAPI = require('./src/sheets.js')
const clock = require('./src/clock.js')
const db = require('./src/db/queries.js')
const SheetsAdmin = require('./src/SheetsAdmin.js'); 
const admin = new SheetsAdmin({ sheetsAPI, db, clock });

const runCLIProgram = fn => {
  fn()
    .then(res => {
      const message = res.message || 'Success!';
      console.log(message);
    })
    .catch(e => {
      if (e.isCustom)
        console.log(e.message);
      else
        console.log(e);
      })
    .finally(() => dbConnection.destroy());
}

require('yargs') 
  .command(
    'query <sheet>',
    'query information from a sheet and print matching rows',
    yargs => yargs
      .option('day', {
        alias: [ 'days' ],
        describe: 'an integer (1-31) with a FUTURE day of the month'
      })
      .option('hour', {
        alias: [ 'hours' ],
        describe: 'A string with a FUTURE hour in the format hh:mm (24 hrs.)'
      })
      .implies('day', 'hour')
      .example('$0 query reservation', 'prints members that reserved at next training hour relative to system time')
      .example('$0 query reservation --hour 18:00', 'prints members that reserved today at 18:00')
      .example('$0 reservation --day 25 --hour 18:00', 'prints members that reserved on the 25th at 18:00'),
    argv => {
      runCLIProgram(() => admin.listMembersThatReservedAtTime(argv));
    })
  
  .help()
  .argv
