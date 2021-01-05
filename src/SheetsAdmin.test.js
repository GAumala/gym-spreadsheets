const dbConnection = require('./db.js')
const db = require('./db/queries.js')
const SheetsAdmin = require('./SheetsAdmin.js');

afterAll(() => dbConnection.destroy());

describe('setMissingUserIDs', () => {
  describe('happy path', () => {
    const reconciliateMembers = jest.fn(() => Promise.resolve());
    const sheetsAPI = {
      loadMemberIDs: jest.fn(() => Promise.resolve({
        data: [
          { 
            id: '',
            nombre: 'Víctor Garzón',
            entrada: '06:00',
            email: '',
            lesiones: '',
          }, { 
            id: '',
            nombre: 'Andrés Coello',
            entrada: '06:00',
            email: '',
            lesiones: '',
          }, { 
            id: 'gonzalo_quezada1',
            nombre: 'Gonzálo Quezada',
            entrada: '06:00',
            email: '',
            lesiones: '',
          }
        ],
        reconciliateFn: reconciliateMembers
      }))
    };
    const clock = {}
    const admin = new SheetsAdmin({ sheetsAPI, db, clock })  
    
    beforeAll(async () => {
      await db.clear();
      return admin.setMissingUserIDs({});
    });

    it('calls sheetsAPI.loadMemberIDs only once', () => {
      expect(sheetsAPI.loadMemberIDs).toHaveBeenCalledTimes(1)
    });

    it('calls reconciliateFn with the member rows with updated ids', () => {
      expect(reconciliateMembers).toHaveBeenCalledTimes(1)

      const newMemberData = reconciliateMembers.mock.calls[0][0];
      expect(newMemberData).toEqual([
        { 
          id: 'victor_garzon',
          nombre: 'Víctor Garzón',
          entrada: '06:00',
          email: '',
          lesiones: '',
        }, { 
          id: 'andres_coello',
          nombre: 'Andrés Coello',
          entrada: '06:00',
          email: '',
          lesiones: '',
        }, { 
          id: 'gonzalo_quezada1',
          nombre: 'Gonzálo Quezada',
          entrada: '06:00',
          email: '',
          lesiones: '',
        }
      ])
    });
  });
});

describe('addNewMember', () => {
  describe('happy path with two timetables', () => {
    const reconciliateMembers = jest.fn(() => Promise.resolve());
    const reconciliateReservations = jest.fn(() => Promise.resolve());
    const sheetsAPI = {
      loadMembers: jest.fn(() => Promise.resolve({
        data: [
          { 
            id: 'jeff',
            nombre: 'Jeff',
            entrada: '18:00',
            email: '',
            lesiones: '',
          }, { 
            id: 'ben',
            nombre: 'Ben',
            entrada: '18:00',
            email: '',
            lesiones: '',
          }
        ],
        reconciliateFn: reconciliateMembers
      })),
      loadReservations: jest.fn(title => Promise.resolve({
        data: [
          { 
            miembro: 'jeff',
            dia: '23-Lun',
            hora: '18:00',
          }, { 
            miembro: 'ben',
            dia: '23-Lun',
            hora: '18:00',
          }
        ],
        reconciliateFn: reconciliateReservations
      }))
    };
    const clock = {
      getFullDateArray: jest.fn(() => [2020, 11, 25, 0, 0])
    }
    const admin = new SheetsAdmin({ sheetsAPI, db, clock })  

    beforeAll(async () => {
      await db.clear();
      return admin.addNewMember({ name: 'Alex', hour: '19:00' });
    })

    it('calls sheetsAPI.loadReservations with the correct titles', async () => {
      expect(sheetsAPI.loadReservations).toHaveBeenCalledTimes(2) 
      expect(sheetsAPI.loadReservations).toHaveBeenCalledWith('NOV-2020'); 
      expect(sheetsAPI.loadReservations).toHaveBeenCalledWith('DIC-2020'); 
    });

    it('calls reconciliateFn with the updated members list', async () => {
      expect(reconciliateMembers.mock.calls).toMatchSnapshot();
    });

    it('calls reconciliateFn with the updated reservations list for each of the 2 sheets', async () => {
      // 2 times for both sheets
      expect(reconciliateReservations).toHaveBeenCalledTimes(2); 
      expect(reconciliateReservations.mock.calls).toMatchSnapshot();
    });
  });

  describe('happy path with only current month timetables', () => {
    const reconciliateMembers = jest.fn(() => Promise.resolve());
    const reconciliateReservations = jest.fn(() => Promise.resolve());
    const sheetsAPI = {
      loadMembers: jest.fn(() => Promise.resolve({
        data: [
          { 
            id: 'jeff',
            nombre: 'Jeff',
            entrada: '18:00',
            email: '',
            lesiones: '',
          }, { 
            id: 'ben',
            nombre: 'Ben',
            entrada: '18:00',
            email: '',
            lesiones: '',
          }
        ],
        reconciliateFn: reconciliateMembers
      })),
      loadReservations: jest.fn(title => {
        if (title !== 'NOV-2020')
          return Promise.resolve({ timeTableMissing: true });

        return Promise.resolve({
          data: [
            { 
              miembro: 'jeff',
              dia: '23-Lun',
              hora: '18:00',
            }, { 
              miembro: 'ben',
              dia: '23-Lun',
              hora: '18:00',
            }
          ],
          reconciliateFn: reconciliateReservations
        });
      })
    };
    const clock = {
      getFullDateArray: jest.fn(() => [2020, 11, 25, 0, 0])
    }
    const admin = new SheetsAdmin({ sheetsAPI, db, clock })  

    beforeAll(async () => {
      await db.clear();
      return admin.addNewMember({ name: 'Jenny', hour: '08:00' });
    })

    it('calls sheetsAPI.loadReservations with the correct titles', async () => {
      expect(sheetsAPI.loadReservations).toHaveBeenCalledTimes(2) 
      expect(sheetsAPI.loadReservations).toHaveBeenCalledWith('NOV-2020'); 
      expect(sheetsAPI.loadReservations).toHaveBeenCalledWith('DIC-2020'); 
    });

    it('calls reconciliateFn with the updated members list', async () => {
      expect(reconciliateMembers.mock.calls).toMatchSnapshot();
    });

    it('calls reconciliateFn with the updated reservations list', async () => {
      expect(reconciliateReservations.mock.calls).toMatchSnapshot();
    });
  });

  describe('when reservation conflicts arise', () => {
    const reconciliateMembers = jest.fn(() => Promise.resolve());
    const reconciliateReservations = jest.fn(() => Promise.resolve());
    const sheetsAPI = {
      loadMembers: jest.fn(() => Promise.resolve({
        data: [
          { 
            id: 'jeff',
            nombre: 'Jeff',
            entrada: '17:00',
            email: '',
            lesiones: '',
          }, { 
            id: 'ben',
            nombre: 'Ben',
            entrada: '17:00',
            email: '',
            lesiones: '',
          }, { 
            id: 'alex',
            nombre: 'Alex',
            entrada: '17:00',
            email: '',
            lesiones: '',
          }, { 
            id: 'paul',
            nombre: 'Paul',
            entrada: '17:00',
            email: '',
            lesiones: '',
          }, { 
            id: 'john',
            nombre: 'John',
            entrada: '17:00',
            email: '',
            lesiones: '',
          }, { 
            id: 'alice',
            nombre: 'Alice',
            entrada: '18:00',
            email: '',
            lesiones: '',
          }, { 
            id: 'jenny',
            nombre: 'Jenny',
            entrada: '18:00',
            email: '',
            lesiones: '',
          }, { 
            id: 'bill',
            nombre: 'Bill',
            entrada: '18:00',
            email: '',
            lesiones: '',
          }, { 
            id: 'fred',
            nombre: 'Fred',
            entrada: '18:00',
            email: '',
            lesiones: '',
          }, { 
            id: 'mary',
            nombre: 'Mary',
            entrada: '18:00',
            email: '',
            lesiones: '',
          }
        ],
        reconciliateFn: reconciliateMembers
      })),
      loadReservations: jest.fn(title => {
        if (title !== 'NOV-2020')
          return Promise.resolve({ timeTableMissing: true });

        return Promise.resolve({
          data: [
            { 
              miembro: 'jeff',
              dia: '25-Mié',
              hora: '17:00',
            }, { 
              miembro: 'ben',
              dia: '25-Mié',
              hora: '17:00',
            }, { 
              miembro: 'alex',
              dia: '25-Mié',
              hora: '17:00',
            }, { 
              miembro: 'paul',
              dia: '25-Mié',
              hora: '17:00',
            }, { 
              miembro: 'john',
              dia: '25-Mié',
              hora: '17:00',
            }, { 
              miembro: 'alice',
              dia: '25-Mié',
              hora: '17:00',
            }, { 
              miembro: 'jenny',
              dia: '25-Mié',
              hora: '17:00',
            }, { 
              miembro: 'bill',
              dia: '25-Mié',
              hora: '17:00',
            }, { 
              miembro: 'fred',
              dia: '25-Mié',
              hora: '17:00',
            }, { 
              miembro: 'mary',
              dia: '25-Mié',
              hora: '17:00',
            }, { 
              miembro: 'fred',
              dia: '26-Mié',
              hora: '18:00',
            }, { 
              miembro: 'mary',
              dia: '26-Mié',
              hora: '18:00',
            }
          ],
          reconciliateFn: reconciliateReservations
        });
      })
    };
    const clock = {
      getFullDateArray: jest.fn(() => [2020, 11, 25, 0, 0])
    }
    const admin = new SheetsAdmin({ sheetsAPI, db, clock })  

    beforeAll(async () => {
      await db.clear();
      return admin.addNewMember({ name: 'David', hour: '17:00' });
    })

    it('calls sheetsAPI.loadReservations with the correct titles', async () => {
      expect(sheetsAPI.loadReservations).toHaveBeenCalledWith('NOV-2020'); 
    });

    it('calls reconciliateFn with the updated members list', async () => {
      expect(reconciliateMembers).toHaveBeenCalledTimes(1)

      const updatedMembersList = reconciliateMembers.mock.calls[0][0]
      expect(updatedMembersList).toHaveLength(11)
      expect(updatedMembersList).toContainEqual({ 
        id: 'david',
        nombre: 'David',
        entrada: '17:00',
        email: '',
        lesiones: '',
      });
    });

    it('calls reconciliateFn without a reservation that would exceed capacity', async () => {
      expect(reconciliateReservations).toHaveBeenCalledTimes(1)
      const updatedReservationsList = reconciliateReservations.mock.calls[0][0]
      expect(updatedReservationsList).not.toContainEqual({
        miembro: 'david',
        hora: '17:00',
        dia: '25-Mié'
      });
      expect(updatedReservationsList).toContainEqual({
        miembro: 'david',
        hora: '17:00',
        dia: '26-Jue'
      });
    });
  });
});

describe('changeReservationHourForADay', () => {
  describe('happy path', () => {
    const reconciliateReservations = jest.fn(() => Promise.resolve());
    const sheetsAPI = {
      loadMembers: jest.fn(() => Promise.resolve({
        data: [
          { 
            id: 'jeff',
            nombre: 'Jeff',
            entrada: '18:00',
            email: '',
            lesiones: '',
          }, { 
            id: 'ben',
            nombre: 'Ben',
            entrada: '18:00',
            email: '',
            lesiones: '',
          }
        ],
        reconciliateFn: jest.fn(() => Promise.resolve())
      })),
      loadReservations: jest.fn(title => Promise.resolve({
        data: [
          { 
            miembro: 'jeff',
            dia: '23-Lun',
            hora: '18:00',
          }, { 
            miembro: 'ben',
            dia: '23-Lun',
            hora: '18:00',
          }
        ],
        reconciliateFn: reconciliateReservations
      }))
    };
    const clock = {
      getFullDateArray: jest.fn(() => [2020, 11, 21, 0, 0])
    }
    const admin = new SheetsAdmin({ sheetsAPI, db, clock })  

    beforeAll(async () => {
      await db.clear();
      await admin.changeReservationHourForADay({ 
        member: 'jeff', 
        hour: '8:00', 
        day: 23 
      });
    });

    it('calls sheetsAPI.loadReservations with the correct title', async () => {
      expect(sheetsAPI.loadReservations).toHaveBeenCalledTimes(1); 
      expect(sheetsAPI.loadReservations).toHaveBeenCalledWith('NOV-2020'); 
    });

    it('calls reconciliateFn with an array containing the changed reservation', () => {
      expect(reconciliateReservations).toHaveBeenCalledTimes(1);
      expect(reconciliateReservations).toHaveBeenCalledWith([
          { 
            miembro: 'jeff',
            dia: '23-Lun',
            hora: '08:00',
          }, { 
            miembro: 'ben',
            dia: '23-Lun',
            hora: '18:00',
          }
        ])
    });
  });

  describe('when target hour is already full', () => {
    const reconciliateReservations = jest.fn(() => Promise.resolve());
    const sheetsAPI = {
      loadMembers: jest.fn(() => Promise.resolve({
        data: [
          { 
            id: 'jeff',
            nombre: 'Jeff',
            entrada: '17:00',
            email: '',
            lesiones: '',
          }, { 
            id: 'ben',
            nombre: 'Ben',
            entrada: '17:00',
            email: '',
            lesiones: '',
          }, { 
            id: 'alex',
            nombre: 'Alex',
            entrada: '17:00',
            email: '',
            lesiones: '',
          }, { 
            id: 'paul',
            nombre: 'Paul',
            entrada: '17:00',
            email: '',
            lesiones: '',
          }, { 
            id: 'john',
            nombre: 'John',
            entrada: '17:00',
            email: '',
            lesiones: '',
          }, { 
            id: 'alice',
            nombre: 'Alice',
            entrada: '18:00',
            email: '',
            lesiones: '',
          }, { 
            id: 'jenny',
            nombre: 'Jenny',
            entrada: '18:00',
            email: '',
            lesiones: '',
          }, { 
            id: 'bill',
            nombre: 'Bill',
            entrada: '18:00',
            email: '',
            lesiones: '',
          }, { 
            id: 'fred',
            nombre: 'Fred',
            entrada: '18:00',
            email: '',
            lesiones: '',
          }, { 
            id: 'mary',
            nombre: 'Mary',
            entrada: '18:00',
            email: '',
            lesiones: '',
          }, { 
            id: 'kevin',
            nombre: 'Kevin',
            entrada: '18:00',
            email: '',
            lesiones: '',
          }
        ],
        reconciliateFn: jest.fn(() => Promise.resolve())
      })),
      loadReservations: jest.fn(title => Promise.resolve({
        data: [
            { 
              miembro: 'jeff',
              dia: '25-Mié',
              hora: '17:00',
            }, { 
              miembro: 'ben',
              dia: '25-Mié',
              hora: '17:00',
            }, { 
              miembro: 'alex',
              dia: '25-Mié',
              hora: '17:00',
            }, { 
              miembro: 'paul',
              dia: '25-Mié',
              hora: '17:00',
            }, { 
              miembro: 'john',
              dia: '25-Mié',
              hora: '17:00',
            }, { 
              miembro: 'alice',
              dia: '25-Mié',
              hora: '17:00',
            }, { 
              miembro: 'jenny',
              dia: '25-Mié',
              hora: '17:00',
            }, { 
              miembro: 'bill',
              dia: '25-Mié',
              hora: '17:00',
            }, { 
              miembro: 'fred',
              dia: '25-Mié',
              hora: '17:00',
            }, { 
              miembro: 'mary',
              dia: '25-Mié',
              hora: '17:00',
            }, { 
              miembro: 'kevin',
              dia: '25-Mié',
              hora: '18:00',
            }, { 
              miembro: 'fred',
              dia: '26-Mié',
              hora: '18:00',
            }, { 
              miembro: 'mary',
              dia: '26-Mié',
              hora: '18:00',
            }
          ],
        reconciliateFn: reconciliateReservations
      }))
    };
    const clock = {
      getFullDateArray: jest.fn(() => [2020, 11, 21, 0, 0])
    }
    const admin = new SheetsAdmin({ sheetsAPI, db, clock })  
    let error;

    beforeAll(async () => {
      await db.clear();
      try {
        await admin.changeReservationHourForADay({ 
          member: 'kevin', 
          hour: '17:00', 
          day: 25 
        });
      } catch (e) {
        error = e;
      }
      
    });

    it('throws a readable error', () => {
      expect(error).toBeDefined(); 
      expect(error).toMatchSnapshot(); 
    });

    it('does not call reconciliateFn', () => {
      expect(reconciliateReservations).not.toHaveBeenCalled();
    });
  });

  describe('when reservation already exists', () => {
    const reconciliateReservations = jest.fn(() => Promise.resolve());
    const sheetsAPI = {
      loadMembers: jest.fn(() => Promise.resolve({
        data: [
          { 
            id: 'jeff',
            nombre: 'Jeff',
            entrada: '18:00',
            email: '',
            lesiones: '',
          }, { 
            id: 'ben',
            nombre: 'Ben',
            entrada: '18:00',
            email: '',
            lesiones: '',
          }
        ],
        reconciliateFn: jest.fn(() => Promise.resolve())
      })),
      loadReservations: jest.fn(title => Promise.resolve({
        data: [
          { 
            miembro: 'jeff',
            dia: '23-Lun',
            hora: '18:00',
          }, { 
            miembro: 'ben',
            dia: '23-Lun',
            hora: '18:00',
          }
        ],
        reconciliateFn: reconciliateReservations
      }))
    };
    const clock = {
      getFullDateArray: jest.fn(() => [2020, 11, 21, 0, 0])
    }
    const admin = new SheetsAdmin({ sheetsAPI, db, clock })  

    let error;

    beforeAll(async () => {
      await db.clear();
      try {
        await admin.changeReservationHourForADay({ 
          member: 'jeff', 
          hour: '18:00', 
          day: 23 
        });
      } catch (e) {
        error = e;
      }
      
    });

    it('throws a readable error', () => {
      expect(error).toBeDefined(); 
      expect(error).toMatchSnapshot(); 
    });

    it('does not call reconciliateFn', () => {
      expect(reconciliateReservations).not.toHaveBeenCalled();
    });
  });

  describe('when timetable has not been created yet', () => {
    const sheetsAPI = {
      loadMembers: jest.fn(() => Promise.resolve({
        data: [
          { 
            id: 'jeff',
            nombre: 'Jeff',
            entrada: '18:00',
            email: '',
            lesiones: '',
          }, { 
            id: 'ben',
            nombre: 'Ben',
            entrada: '18:00',
            email: '',
            lesiones: '',
          }
        ],
        reconciliateFn: jest.fn(() => Promise.resolve())
      })),
      loadReservations: jest.fn(title => Promise.resolve({
        timeTableMissing: true
      }))
    };
    const clock = {
      getFullDateArray: jest.fn(() => [2020, 11, 29, 0, 0])
    }
    const admin = new SheetsAdmin({ sheetsAPI, db, clock })  

    let error;

    beforeAll(async () => {
      await db.clear();
      try {
        await admin.changeReservationHourForADay({ 
          member: 'jeff', 
          hour: '18:00', 
          day: 1 
        });
      } catch (e) {
        error = e;
      }
      
    });

    it('calls sheetsAPI.loadReservations with the correct title', async () => {
      expect(sheetsAPI.loadReservations).toHaveBeenCalledTimes(1); 
      expect(sheetsAPI.loadReservations).toHaveBeenCalledWith('DIC-2020'); 
    });

    it('throws a readable error', () => {
      expect(error).toBeDefined(); 
      expect(error).toMatchSnapshot(); 
    });
  });
});

describe('listMembersThatReservedAtTime', () => {
  describe('happy path with empty arguments', () => {
    const reconciliateReservations = jest.fn();
    const sheetsAPI = {
      loadMembers: jest.fn(() => Promise.resolve({
        data: [
          { 
            id: 'jeff',
            nombre: 'Jeff',
            entrada: '18:00',
            email: '',
            lesiones: '',
          }, { 
            id: 'ben',
            nombre: 'Ben',
            entrada: '18:00',
            email: '',
            lesiones: '',
          }, { 
            id: 'tom',
            nombre: 'Tom',
            entrada: '19:00',
            email: '',
            lesiones: '',
          }
        ],
        reconciliateFn: jest.fn(() => Promise.resolve())
      })),
      loadReservations: jest.fn(title => Promise.resolve({
        data: [
          { 
            miembro: 'jeff',
            dia: '23-Lun',
            hora: '18:00',
          }, { 
            miembro: 'ben',
            dia: '23-Lun',
            hora: '18:00',
          }, { 
            miembro: 'tom',
            dia: '23-Lun',
            hora: '19:00',
          }, { 
            miembro: 'jeff',
            dia: '24-Mar',
            hora: '06:00',
          }, { 
            miembro: 'ben',
            dia: '24-Mar',
            hora: '18:00',
          }, { 
            miembro: 'tom',
            dia: '23-Mar',
            hora: '19:00',
          }
        ],
        reconciliateFn: reconciliateReservations
      }))
    };
    const clock = {
      getFullDateArray: jest.fn(() => [2020, 11, 23, 17, 15])
    }
    const admin = new SheetsAdmin({ sheetsAPI, db, clock })  

    beforeAll(async () => {
      await db.clear();
    });

    it('calls sheetsAPI.loadReservations with the correct titles', async () => {
      sheetsAPI.loadReservations.mockClear();

      await admin.listMembersThatReservedAtTime({ });

      expect(sheetsAPI.loadReservations).toHaveBeenCalledTimes(1) 
      expect(sheetsAPI.loadReservations).toHaveBeenCalledWith('NOV-2020'); 
    });

    it('returns a readable message with member names', async () => {
      const res = await admin.listMembersThatReservedAtTime({ });
      expect(res.message).toMatchSnapshot();
    });

    it('uses next training hour relative to current time when no arguments are specified', async () => {
      const res = await admin.listMembersThatReservedAtTime({ });
      expect(res.data).toEqual([
        { 
          nombre: 'Jeff',
          dia: '23-Lun',
          hora: '18:00',
        }, { 
          nombre: 'Ben',
          dia: '23-Lun',
          hora: '18:00',
        }
      ]);
    });

    it('uses both day and hour when they are specified', async () => {
      const res = await admin.listMembersThatReservedAtTime({ 
        day: 24, hour: '18:00' 
      });
      expect(res.data).toEqual([
        { 
          nombre: 'Ben',
          dia: '24-Mar',
          hora: '18:00',
        }
      ]);
    });

    it('uses current time day when only hour is specified', async () => {
      const res = await admin.listMembersThatReservedAtTime({ 
        hour: '19:00' 
      });
      expect(res.data).toEqual([
        { 
          nombre: 'Tom',
          dia: '23-Lun',
          hora: '19:00',
        }
      ]);
    });
  });
});

describe('createTimeTableSheet', () => {
  describe('happy path', () => {
    const reconciliateReservations = jest.fn();
    const sheetsAPI = {
      loadMembers: jest.fn(() => Promise.resolve({
        data: [
          { 
            id: 'jeff',
            nombre: 'Jeff',
            entrada: '18:00',
            email: '',
            lesiones: '',
          }, { 
            id: 'ben',
            nombre: 'Ben',
            entrada: '18:00',
            email: '',
            lesiones: '',
          }, { 
            id: 'tom',
            nombre: 'Tom',
            entrada: '19:00',
            email: '',
            lesiones: '',
          }
        ],
        reconciliateFn: jest.fn(() => Promise.resolve())
      })),
      createTimeTableSheet: jest.fn(title => Promise.resolve({
        data: [],
        reconciliateFn: reconciliateReservations
      }))
    };

    const clock = {
      getFullDateArray: jest.fn(() => [2020, 11, 23, 21, 15])
    }
    const admin = new SheetsAdmin({ sheetsAPI, db, clock })  

    beforeEach(async () => {
      await db.clear();
    })

    describe('without flags', () => {
      beforeAll(async () => {
        sheetsAPI.createTimeTableSheet.mockClear();
        reconciliateReservations.mockClear();

        await admin.createTimeTableSheet({});
      });

      it('calls sheetsAPI.createTimeTableSheet with the correct titles', async () => {

        expect(sheetsAPI.createTimeTableSheet).toHaveBeenCalledTimes(1) 
        expect(sheetsAPI.createTimeTableSheet).toHaveBeenCalledWith('DIC-2020'); 
      });

      it('calls reconciliateFn with the full generated timetable', async () => {
        expect(reconciliateReservations).toHaveBeenCalledTimes(1) 

        const timeTable = reconciliateReservations.mock.calls[0][0];
        expect(timeTable).toHaveLength(81); // (31 - 4) * 3
        expect(timeTable).toMatchSnapshot();
      });
    });

    describe('with the this-month flag', () => {
      beforeAll(async () => {
        sheetsAPI.createTimeTableSheet.mockClear();
        reconciliateReservations.mockClear();

        await admin.createTimeTableSheet({ ['this-month']: true });
      });

      it('calls sheetsAPI.createTimeTableSheet with the correct titles', async () => {

        expect(sheetsAPI.createTimeTableSheet).toHaveBeenCalledTimes(1) 
        expect(sheetsAPI.createTimeTableSheet).toHaveBeenCalledWith('NOV-2020'); 
      });

      it('calls reconciliateFn with the full generated timetable', async () => {
        expect(reconciliateReservations).toHaveBeenCalledTimes(1) 

        const timeTable = reconciliateReservations.mock.calls[0][0];
        expect(timeTable).toHaveLength(75); // (30 - 5) * 3 
      });
    });
  });
});
