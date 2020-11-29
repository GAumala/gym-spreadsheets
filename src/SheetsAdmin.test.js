const dbConnection = require('./db.js')
const db = require('./db/queries.js')
const SheetsAdmin = require('./SheetsAdmin.js');

afterAll(() => dbConnection.destroy());

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
      loadTimeSlots: jest.fn(title => Promise.resolve({
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
      return admin.addNewMember({ nombre: 'Alex', entrada: '19:00' });
    })

    it('calls sheetsAPI.loadTimeSlots with the correct titles', async () => {
      expect(sheetsAPI.loadTimeSlots).toHaveBeenCalledTimes(2) 
      expect(sheetsAPI.loadTimeSlots).toHaveBeenCalledWith('NOV-2020'); 
      expect(sheetsAPI.loadTimeSlots).toHaveBeenCalledWith('DEC-2020'); 
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
      loadTimeSlots: jest.fn(title => {
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
      return admin.addNewMember({ nombre: 'Jenny', entrada: '08:00' });
    })

    it('calls sheetsAPI.loadTimeSlots with the correct titles', async () => {
      expect(sheetsAPI.loadTimeSlots).toHaveBeenCalledTimes(2) 
      expect(sheetsAPI.loadTimeSlots).toHaveBeenCalledWith('NOV-2020'); 
      expect(sheetsAPI.loadTimeSlots).toHaveBeenCalledWith('DEC-2020'); 
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
      loadTimeSlots: jest.fn(title => {
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
      return admin.addNewMember({ nombre: 'David', entrada: '17:00' });
    })

    it('calls sheetsAPI.loadTimeSlots with the correct titles', async () => {
      expect(sheetsAPI.loadTimeSlots).toHaveBeenCalledWith('NOV-2020'); 
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
      loadTimeSlots: jest.fn(title => Promise.resolve({
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
        miembro: 'jeff', 
        hora: '8:00', 
        dia: 23 
      });
    });

    it('calls sheetsAPI.loadTimeSlots with the correct title', async () => {
      expect(sheetsAPI.loadTimeSlots).toHaveBeenCalledTimes(1); 
      expect(sheetsAPI.loadTimeSlots).toHaveBeenCalledWith('NOV-2020'); 
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
      loadTimeSlots: jest.fn(title => Promise.resolve({
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
          miembro: 'kevin', 
          hora: '17:00', 
          dia: 25 
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
      loadTimeSlots: jest.fn(title => Promise.resolve({
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
                miembro: 'jeff', 
                hora: '18:00', 
                dia: 23 
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

  describe.only('when timetable has not been created yet', () => {
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
      loadTimeSlots: jest.fn(title => Promise.resolve({
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
                miembro: 'jeff', 
                hora: '18:00', 
                dia: 1 
              });
      } catch (e) {
        error = e;
      }
      
    });

    it('calls sheetsAPI.loadTimeSlots with the correct title', async () => {
      expect(sheetsAPI.loadTimeSlots).toHaveBeenCalledTimes(1); 
      expect(sheetsAPI.loadTimeSlots).toHaveBeenCalledWith('DEC-2020'); 
    });

    it('throws a readable error', () => {
      expect(error).toBeDefined(); 
      expect(error).toMatchSnapshot(); 
    });
  });
});
