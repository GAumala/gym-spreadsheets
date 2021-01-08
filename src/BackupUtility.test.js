const dbConnection = require('./db.js')
const BackupUtility = require('./BackupUtility.js');

jest.mock('./lib/dateFormatters.js', () => ({
  getReadableDateTime: timestamp => '' + timestamp
}))

afterAll(() => dbConnection.destroy());

describe('listHistory', () => {
  it('returns a readable message', async () => {
    const cache = {
      listHistory: jest.fn(() => Promise.resolve([
        { key: '7091e4465e', 
          systemTime: 1609802004000, 
          args: ['reservations', 'create-sheet'] 
        },
        { key: '361497c687', 
          systemTime: 1609802124000, 
          args: ['members', 'add', '--name', 'Jeff'] 
        }
      ]))
    }
    const backup = new BackupUtility({ cache })  
    const { message } = await backup.listHistory();
    expect(message).toMatchSnapshot()
  });
});

describe('undo', () => {
  it('throws immediately if no files are found with the specfied hash', async () => {
    const cache = {
      findFilesByKey: jest.fn(() => Promise.resolve([]))
    }
    const backup = new BackupUtility({ cache })
    let error;
    try {
      await backup.undo({ hash: 'da55ef' })
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error).toMatchSnapshot();
  });

  it('throws immediately if backup files are corrupted', async () => {
    const cache = {
      findFilesByKey: jest.fn(() => Promise.resolve([
        { type: 'new-timetable' }
      ]))
    }
    const backup = new BackupUtility({ cache })
    let error;
    try {
      await backup.undo({ hash: 'da55ef' })
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error).toMatchSnapshot();
  });

  it('handles create timetable sheet operation', async () => {
    const restoredMembers = [ 
      { id: 'tim', nombre: 'Tim', email: '', notas: '', entrada: '08:00' }, 
      { id: 'ben', nombre: 'Ben', email: '', notas: '', entrada: '08:00' }, 
    ];
    const cache = {
      findFilesByKey: jest.fn(() => Promise.resolve([
        { type: 'metadata' },
        { type: 'members', data: restoredMembers },
        { type: 'new-timetable', sheetTitle: 'DIC-2020' },
      ]))
    };
    const reconciliateMembers = jest.fn(() => Promise.resolve());
    const sheetsAPI = {
      deleteTimeTableSheet: jest.fn(() => Promise.resolve()),
      loadMembers: jest.fn(() => Promise.resolve({
        reconciliateFn: reconciliateMembers
      }))
    }
    const backup = new BackupUtility({ cache, sheetsAPI })
    await backup.undo({ hash: 'da55ef' })

    expect(sheetsAPI.deleteTimeTableSheet)
      .toHaveBeenCalledWith('DIC-2020');
    expect(reconciliateMembers)
      .toHaveBeenCalledWith(restoredMembers);
  });

  it('handles reservations and members', async () => {
    const restoredMembers = [ 
      { id: 'tim', nombre: 'Tim', email: '', notas: '', entrada: '08:00' }, 
      { id: 'ben', nombre: 'Ben', email: '', notas: '', entrada: '08:00' }, 
    ];
    const restoredReservations = [ 
      { miembro: 'tim', hora: '08:00', dia: '01-Mié' }, 
      { miembro: 'ben', hora: '08:00', dia: '01-Mié' }, 
      { miembro: 'tim', hora: '08:00', dia: '02-Jue' }, 
      { miembro: 'ben', hora: '08:00', dia: '02-Jue' }, 
    ];
    const cache = {
      findFilesByKey: jest.fn(() => Promise.resolve([
        { type: 'metadata' },
        { type: 'members', data: restoredMembers },
        { type: 'reservations', 
          sheetTitle: 'DIC-2020',
          data: restoredReservations 
        }
      ]))
    };
    const reconciliateMembers = jest.fn(() => Promise.resolve());
    const reconciliateReservations = jest.fn(() => Promise.resolve());
    const sheetsAPI = {
      loadMembers: jest.fn(() => Promise.resolve({
        reconciliateFn: reconciliateMembers
      })),
      loadReservations: jest.fn(() => Promise.resolve({
        reconciliateFn: reconciliateReservations
      }))
    }
    const backup = new BackupUtility({ cache, sheetsAPI })
    await backup.undo({ hash: 'da55ef' })

    expect(reconciliateMembers)
      .toHaveBeenCalledWith(restoredMembers);

    expect(sheetsAPI.loadReservations)
      .toHaveBeenCalledWith('DIC-2020');
    expect(reconciliateReservations)
      .toHaveBeenCalledWith(restoredReservations);
  });

  it('handles reservations when timetable no longer exists', async () => {
    const restoredReservations = [ 
      { miembro: 'tim', hora: '08:00', dia: '01-Mié' }, 
      { miembro: 'ben', hora: '08:00', dia: '01-Mié' }, 
      { miembro: 'tim', hora: '08:00', dia: '02-Jue' }, 
      { miembro: 'ben', hora: '08:00', dia: '02-Jue' }, 
    ];
    const cache = {
      findFilesByKey: jest.fn(() => Promise.resolve([
        { type: 'metadata' },
        { type: 'reservations', 
          sheetTitle: 'DIC-2020',
          data: restoredReservations 
        }
      ]))
    };
    const reconciliateReservations = jest.fn(() => Promise.resolve());
    const sheetsAPI = {
      loadReservations: jest.fn(() => Promise.resolve({
        err: 'SHEET_NOT_FOUND'
      })),
      createTimeTableSheet: jest.fn(() => Promise.resolve({
        reconciliateFn: reconciliateReservations
      })),
    }
    const backup = new BackupUtility({ cache, sheetsAPI })
    await backup.undo({ hash: 'da55ef' })

    expect(sheetsAPI.loadReservations)
      .toHaveBeenCalledWith('DIC-2020');
    expect(sheetsAPI.createTimeTableSheet)
      .toHaveBeenCalledWith('DIC-2020');
    expect(reconciliateReservations)
      .toHaveBeenCalledWith(restoredReservations);
  });
});
