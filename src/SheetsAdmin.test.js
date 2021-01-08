const dbConnection = require("./db.js");
const db = require("./db/queries.js");
const SheetsAdmin = require("./SheetsAdmin.js");

const testingMembers = [
  {
    id: "jeff",
    nombre: "Jeff",
    entrada: "17:00",
    email: "",
    notas: "",
  },
  {
    id: "ben",
    nombre: "Ben",
    entrada: "17:00",
    email: "",
    notas: "",
  },
  {
    id: "alex",
    nombre: "Alex",
    entrada: "17:00",
    email: "",
    notas: "",
  },
  {
    id: "paul",
    nombre: "Paul",
    entrada: "17:00",
    email: "",
    notas: "",
  },
  {
    id: "john",
    nombre: "John",
    entrada: "17:00",
    email: "",
    notas: "",
  },
  {
    id: "alice",
    nombre: "Alice",
    entrada: "18:00",
    email: "",
    notas: "",
  },
  {
    id: "jenny",
    nombre: "Jenny",
    entrada: "18:00",
    email: "",
    notas: "",
  },
  {
    id: "bill",
    nombre: "Bill",
    entrada: "18:00",
    email: "",
    notas: "",
  },
  {
    id: "fred",
    nombre: "Fred",
    entrada: "18:00",
    email: "",
    notas: "",
  },
  {
    id: "mary",
    nombre: "Mary",
    entrada: "18:00",
    email: "",
    notas: "",
  },
  {
    id: "kevin",
    nombre: "Kevin",
    entrada: "18:00",
    email: "",
    notas: "",
  },
];

afterAll(() => dbConnection.destroy());

describe("setMissingUserIDs", () => {
  describe("happy path", () => {
    const reconciliateMembers = jest.fn(() => Promise.resolve());
    const sheetsAPI = {
      loadMemberIDs: jest.fn(() =>
        Promise.resolve({
          data: [
            {
              id: "",
              nombre: "Víctor Garzón",
              entrada: "06:00",
              email: "",
              notas: "",
            },
            {
              id: "",
              nombre: "Andrés Coello",
              entrada: "06:00",
              email: "",
              notas: "",
            },
            {
              id: "gonzalo_quezada1",
              nombre: "Gonzálo Quezada",
              entrada: "06:00",
              email: "",
              notas: "",
            },
          ],
          reconciliateFn: reconciliateMembers,
        })
      ),
    };
    const clock = {};
    const admin = new SheetsAdmin({ sheetsAPI, db, clock });

    beforeAll(async () => {
      await db.clear();
      return admin.setMissingUserIDs({});
    });

    it("calls sheetsAPI.loadMemberIDs only once", () => {
      expect(sheetsAPI.loadMemberIDs).toHaveBeenCalledTimes(1);
    });

    it("calls reconciliateFn with the member rows with updated ids", () => {
      expect(reconciliateMembers).toHaveBeenCalledTimes(1);

      const newMemberData = reconciliateMembers.mock.calls[0][0];
      expect(newMemberData).toEqual([
        {
          id: "victor_garzon",
          nombre: "Víctor Garzón",
          entrada: "06:00",
          email: "",
          notas: "",
        },
        {
          id: "andres_coello",
          nombre: "Andrés Coello",
          entrada: "06:00",
          email: "",
          notas: "",
        },
        {
          id: "gonzalo_quezada1",
          nombre: "Gonzálo Quezada",
          entrada: "06:00",
          email: "",
          notas: "",
        },
      ]);
    });
  });
});

describe("addNewMember", () => {
  describe("happy path with two timetables", () => {
    const reconciliateMembers = jest.fn(() => Promise.resolve());
    const reconciliateReservations = jest.fn(() => Promise.resolve());
    const sheetsAPI = {
      loadMembers: jest.fn(() =>
        Promise.resolve({
          data: testingMembers.slice(0, 2),
          reconciliateFn: reconciliateMembers,
        })
      ),
      loadReservations: jest.fn(() =>
        Promise.resolve({
          data: [
            {
              miembro: "jeff",
              dia: "23-Lun",
              hora: "18:00",
            },
            {
              miembro: "ben",
              dia: "23-Lun",
              hora: "18:00",
            },
          ],
          reconciliateFn: reconciliateReservations,
        })
      ),
    };
    const clock = {
      getFullDateArray: jest.fn(() => [2020, 11, 25, 0, 0]),
    };
    const admin = new SheetsAdmin({ sheetsAPI, db, clock });

    beforeAll(async () => {
      await db.clear();
      return admin.addNewMember({ name: "Alex", hour: "19:00" });
    });

    it("calls sheetsAPI.loadReservations with the correct titles", async () => {
      expect(sheetsAPI.loadReservations).toHaveBeenCalledTimes(2);
      expect(sheetsAPI.loadReservations).toHaveBeenCalledWith("NOV-2020");
      expect(sheetsAPI.loadReservations).toHaveBeenCalledWith("DIC-2020");
    });

    it("calls reconciliateFn with the updated members list", async () => {
      expect(reconciliateMembers.mock.calls).toMatchSnapshot();
    });

    it("calls reconciliateFn with the updated reservations list for each of the 2 sheets", async () => {
      // 2 times for both sheets
      expect(reconciliateReservations).toHaveBeenCalledTimes(2);
      expect(reconciliateReservations.mock.calls).toMatchSnapshot();
    });
  });

  describe("happy path with only current month timetables", () => {
    const reconciliateMembers = jest.fn(() => Promise.resolve());
    const reconciliateReservations = jest.fn(() => Promise.resolve());
    const sheetsAPI = {
      loadMembers: jest.fn(() =>
        Promise.resolve({
          data: testingMembers.slice(0, 2),
          reconciliateFn: reconciliateMembers,
        })
      ),
      loadReservations: jest.fn((title) => {
        if (title !== "NOV-2020")
          return Promise.resolve({ timeTableMissing: true });

        return Promise.resolve({
          data: [
            {
              miembro: "jeff",
              dia: "23-Lun",
              hora: "18:00",
            },
            {
              miembro: "ben",
              dia: "23-Lun",
              hora: "18:00",
            },
          ],
          reconciliateFn: reconciliateReservations,
        });
      }),
    };
    const clock = {
      getFullDateArray: jest.fn(() => [2020, 11, 25, 0, 0]),
    };
    const admin = new SheetsAdmin({ sheetsAPI, db, clock });

    beforeAll(async () => {
      await db.clear();
      return admin.addNewMember({ name: "Jenny", hour: "08:00" });
    });

    it("calls sheetsAPI.loadReservations with the correct titles", async () => {
      expect(sheetsAPI.loadReservations).toHaveBeenCalledTimes(2);
      expect(sheetsAPI.loadReservations).toHaveBeenCalledWith("NOV-2020");
      expect(sheetsAPI.loadReservations).toHaveBeenCalledWith("DIC-2020");
    });

    it("calls reconciliateFn with the updated members list", async () => {
      expect(reconciliateMembers.mock.calls).toMatchSnapshot();
    });

    it("calls reconciliateFn with the updated reservations list", async () => {
      expect(reconciliateReservations.mock.calls).toMatchSnapshot();
    });
  });

  describe("when reservation conflicts arise", () => {
    const reconciliateMembers = jest.fn(() => Promise.resolve());
    const reconciliateReservations = jest.fn(() => Promise.resolve());
    const sheetsAPI = {
      loadMembers: jest.fn(() =>
        Promise.resolve({
          data: testingMembers,
          reconciliateFn: reconciliateMembers,
        })
      ),
      loadReservations: jest.fn((title) => {
        if (title !== "NOV-2020")
          return Promise.resolve({ timeTableMissing: true });

        return Promise.resolve({
          data: [
            {
              miembro: "jeff",
              dia: "25-Mié",
              hora: "17:00",
            },
            {
              miembro: "ben",
              dia: "25-Mié",
              hora: "17:00",
            },
            {
              miembro: "alex",
              dia: "25-Mié",
              hora: "17:00",
            },
            {
              miembro: "paul",
              dia: "25-Mié",
              hora: "17:00",
            },
            {
              miembro: "john",
              dia: "25-Mié",
              hora: "17:00",
            },
            {
              miembro: "alice",
              dia: "25-Mié",
              hora: "17:00",
            },
            {
              miembro: "jenny",
              dia: "25-Mié",
              hora: "17:00",
            },
            {
              miembro: "bill",
              dia: "25-Mié",
              hora: "17:00",
            },
            {
              miembro: "fred",
              dia: "25-Mié",
              hora: "17:00",
            },
            {
              miembro: "mary",
              dia: "25-Mié",
              hora: "17:00",
            },
            {
              miembro: "fred",
              dia: "26-Mié",
              hora: "18:00",
            },
            {
              miembro: "mary",
              dia: "26-Mié",
              hora: "18:00",
            },
          ],
          reconciliateFn: reconciliateReservations,
        });
      }),
    };
    const clock = {
      getFullDateArray: jest.fn(() => [2020, 11, 25, 0, 0]),
    };
    const admin = new SheetsAdmin({ sheetsAPI, db, clock });

    beforeAll(async () => {
      await db.clear();
      return admin.addNewMember({ name: "David", hour: "17:00" });
    });

    it("calls sheetsAPI.loadReservations with the correct titles", async () => {
      expect(sheetsAPI.loadReservations).toHaveBeenCalledWith("NOV-2020");
    });

    it("calls reconciliateFn with the updated members list", async () => {
      expect(reconciliateMembers).toHaveBeenCalledTimes(1);

      const updatedMembersList = reconciliateMembers.mock.calls[0][0];
      expect(updatedMembersList).toHaveLength(12);
      expect(updatedMembersList).toContainEqual({
        id: "david",
        nombre: "David",
        entrada: "17:00",
        email: "",
        notas: "",
      });
    });

    it("calls reconciliateFn without a reservation that would exceed capacity", async () => {
      expect(reconciliateReservations).toHaveBeenCalledTimes(1);
      const updatedReservationsList = reconciliateReservations.mock.calls[0][0];
      expect(updatedReservationsList).not.toContainEqual({
        miembro: "david",
        hora: "17:00",
        dia: "25-Mié",
      });
      expect(updatedReservationsList).toContainEqual({
        miembro: "david",
        hora: "17:00",
        dia: "26-Jue",
      });
    });
  });
});

describe("changeReservationHourForADay", () => {
  describe("happy path", () => {
    const reconciliateReservations = jest.fn(() => Promise.resolve());
    const sheetsAPI = {
      loadMembers: jest.fn(() =>
        Promise.resolve({
          data: testingMembers.slice(0, 2),
          reconciliateFn: jest.fn(() => Promise.resolve()),
        })
      ),
      loadReservations: jest.fn(() =>
        Promise.resolve({
          data: [
            {
              miembro: "jeff",
              dia: "23-Lun",
              hora: "18:00",
            },
            {
              miembro: "ben",
              dia: "23-Lun",
              hora: "18:00",
            },
          ],
          reconciliateFn: reconciliateReservations,
        })
      ),
    };
    const clock = {
      getFullDateArray: jest.fn(() => [2020, 11, 21, 0, 0]),
    };
    const admin = new SheetsAdmin({ sheetsAPI, db, clock });

    beforeAll(async () => {
      await db.clear();
      await admin.changeReservationHourForADay({
        member: "jeff",
        hour: "8:00",
        day: 23,
      });
    });

    it("calls sheetsAPI.loadReservations with the correct title", async () => {
      expect(sheetsAPI.loadReservations).toHaveBeenCalledTimes(1);
      expect(sheetsAPI.loadReservations).toHaveBeenCalledWith("NOV-2020");
    });

    it("calls reconciliateFn with an array containing the changed reservation", () => {
      expect(reconciliateReservations).toHaveBeenCalledTimes(1);
      expect(reconciliateReservations).toHaveBeenCalledWith([
        {
          miembro: "jeff",
          dia: "23-Lun",
          hora: "08:00",
        },
        {
          miembro: "ben",
          dia: "23-Lun",
          hora: "18:00",
        },
      ]);
    });
  });

  describe("when target hour is already full", () => {
    const reconciliateReservations = jest.fn(() => Promise.resolve());
    const sheetsAPI = {
      loadMembers: jest.fn(() =>
        Promise.resolve({
          data: testingMembers,
          reconciliateFn: jest.fn(() => Promise.resolve()),
        })
      ),
      loadReservations: jest.fn(() =>
        Promise.resolve({
          data: [
            {
              miembro: "jeff",
              dia: "25-Mié",
              hora: "17:00",
            },
            {
              miembro: "ben",
              dia: "25-Mié",
              hora: "17:00",
            },
            {
              miembro: "alex",
              dia: "25-Mié",
              hora: "17:00",
            },
            {
              miembro: "paul",
              dia: "25-Mié",
              hora: "17:00",
            },
            {
              miembro: "john",
              dia: "25-Mié",
              hora: "17:00",
            },
            {
              miembro: "alice",
              dia: "25-Mié",
              hora: "17:00",
            },
            {
              miembro: "jenny",
              dia: "25-Mié",
              hora: "17:00",
            },
            {
              miembro: "bill",
              dia: "25-Mié",
              hora: "17:00",
            },
            {
              miembro: "fred",
              dia: "25-Mié",
              hora: "17:00",
            },
            {
              miembro: "mary",
              dia: "25-Mié",
              hora: "17:00",
            },
            {
              miembro: "kevin",
              dia: "25-Mié",
              hora: "18:00",
            },
            {
              miembro: "fred",
              dia: "26-Mié",
              hora: "18:00",
            },
            {
              miembro: "mary",
              dia: "26-Mié",
              hora: "18:00",
            },
          ],
          reconciliateFn: reconciliateReservations,
        })
      ),
    };
    const clock = {
      getFullDateArray: jest.fn(() => [2020, 11, 21, 0, 0]),
    };
    const admin = new SheetsAdmin({ sheetsAPI, db, clock });
    let error;

    beforeAll(async () => {
      await db.clear();
      try {
        await admin.changeReservationHourForADay({
          member: "kevin",
          hour: "17:00",
          day: 25,
        });
      } catch (e) {
        error = e;
      }
    });

    it("throws a readable error", () => {
      expect(error).toBeDefined();
      expect(error).toMatchSnapshot();
    });

    it("does not call reconciliateFn", () => {
      expect(reconciliateReservations).not.toHaveBeenCalled();
    });
  });

  describe("when reservation already exists", () => {
    const reconciliateReservations = jest.fn(() => Promise.resolve());
    const sheetsAPI = {
      loadMembers: jest.fn(() =>
        Promise.resolve({
          data: testingMembers.slice(0, 2),
          reconciliateFn: jest.fn(() => Promise.resolve()),
        })
      ),
      loadReservations: jest.fn(() =>
        Promise.resolve({
          data: [
            {
              miembro: "jeff",
              dia: "23-Lun",
              hora: "18:00",
            },
            {
              miembro: "ben",
              dia: "23-Lun",
              hora: "18:00",
            },
          ],
          reconciliateFn: reconciliateReservations,
        })
      ),
    };
    const clock = {
      getFullDateArray: jest.fn(() => [2020, 11, 21, 0, 0]),
    };
    const admin = new SheetsAdmin({ sheetsAPI, db, clock });

    let error;

    beforeAll(async () => {
      await db.clear();
      try {
        await admin.changeReservationHourForADay({
          member: "jeff",
          hour: "18:00",
          day: 23,
        });
      } catch (e) {
        error = e;
      }
    });

    it("throws a readable error", () => {
      expect(error).toBeDefined();
      expect(error).toMatchSnapshot();
    });

    it("does not call reconciliateFn", () => {
      expect(reconciliateReservations).not.toHaveBeenCalled();
    });
  });

  describe("when timetable has not been created yet", () => {
    const sheetsAPI = {
      loadMembers: jest.fn(() =>
        Promise.resolve({
          data: testingMembers.slice(0, 2),
          reconciliateFn: jest.fn(() => Promise.resolve()),
        })
      ),
      loadReservations: jest.fn(() =>
        Promise.resolve({
          timeTableMissing: true,
        })
      ),
    };
    const clock = {
      getFullDateArray: jest.fn(() => [2020, 11, 29, 0, 0]),
    };
    const admin = new SheetsAdmin({ sheetsAPI, db, clock });

    let error;

    beforeAll(async () => {
      await db.clear();
      try {
        await admin.changeReservationHourForADay({
          member: "jeff",
          hour: "18:00",
          day: 1,
        });
      } catch (e) {
        error = e;
      }
    });

    it("calls sheetsAPI.loadReservations with the correct title", async () => {
      expect(sheetsAPI.loadReservations).toHaveBeenCalledTimes(1);
      expect(sheetsAPI.loadReservations).toHaveBeenCalledWith("DIC-2020");
    });

    it("throws a readable error", () => {
      expect(error).toBeDefined();
      expect(error).toMatchSnapshot();
    });
  });
});

describe("listMembersThatReservedAtTime", () => {
  describe("happy path with empty arguments", () => {
    const reconciliateReservations = jest.fn();
    const sheetsAPI = {
      loadMembers: jest.fn(() =>
        Promise.resolve({
          data: testingMembers,
          reconciliateFn: jest.fn(() => Promise.resolve()),
        })
      ),
      loadReservations: jest.fn(() =>
        Promise.resolve({
          data: [
            {
              miembro: "jeff",
              dia: "23-Lun",
              hora: "18:00",
            },
            {
              miembro: "ben",
              dia: "23-Lun",
              hora: "18:00",
            },
            {
              miembro: "paul",
              dia: "23-Lun",
              hora: "17:00",
            },
            {
              miembro: "alex",
              dia: "23-Lun",
              hora: "19:00",
            },
            {
              miembro: "jeff",
              dia: "24-Mar",
              hora: "06:00",
            },
            {
              miembro: "ben",
              dia: "24-Mar",
              hora: "18:00",
            },
            {
              miembro: "paul",
              dia: "24-Mar",
              hora: "19:00",
            },
          ],
          reconciliateFn: reconciliateReservations,
        })
      ),
    };
    const clock = {
      getFullDateArray: jest.fn(() => [2020, 11, 23, 17, 15]),
    };
    const admin = new SheetsAdmin({ sheetsAPI, db, clock });

    beforeAll(async () => {
      await db.clear();
    });

    it("calls sheetsAPI.loadReservations with the current month title", async () => {
      sheetsAPI.loadReservations.mockClear();

      await admin.listMembersThatReservedAtTime({});

      expect(sheetsAPI.loadReservations).toHaveBeenCalledTimes(1);
      expect(sheetsAPI.loadReservations).toHaveBeenCalledWith("NOV-2020");
    });

    it("calls sheetsAPI.loadReservations with the next month title", async () => {
      sheetsAPI.loadReservations.mockClear();

      await admin.listMembersThatReservedAtTime({ day: 20, hour: "18:00" });

      expect(sheetsAPI.loadReservations).toHaveBeenCalledTimes(1);
      expect(sheetsAPI.loadReservations).toHaveBeenCalledWith("DIC-2020");
    });

    it("returns a readable message with member names", async () => {
      const res = await admin.listMembersThatReservedAtTime({});
      expect(res.message).toMatchSnapshot();
    });

    it("uses next training hour relative to current time when no arguments are specified", async () => {
      const res = await admin.listMembersThatReservedAtTime({});
      expect(res.data).toEqual([
        {
          nombre: "Jeff",
          dia: "23-Lun",
          hora: "18:00",
        },
        {
          nombre: "Ben",
          dia: "23-Lun",
          hora: "18:00",
        },
      ]);
    });

    it("uses both day and hour when they are specified", async () => {
      const res = await admin.listMembersThatReservedAtTime({
        day: 24,
        hour: "18:00",
      });
      expect(res.data).toEqual([
        {
          nombre: "Ben",
          dia: "24-Mar",
          hora: "18:00",
        },
      ]);
    });

    it("uses current time day when only hour is specified", async () => {
      const res = await admin.listMembersThatReservedAtTime({
        hour: "19:00",
      });
      expect(res.data).toEqual([
        {
          nombre: "Alex",
          dia: "23-Lun",
          hora: "19:00",
        },
      ]);
    });

    it("can query past hours in the current day", async () => {
      const res = await admin.listMembersThatReservedAtTime({
        hour: "17:00",
      });
      expect(res.data).toEqual([
        {
          nombre: "Paul",
          dia: "23-Lun",
          hora: "17:00",
        },
      ]);
    });
  });
});

describe("createTimeTableSheet", () => {
  describe("happy path", () => {
    const reconciliateReservations = jest.fn();
    const sheetsAPI = {
      loadMembers: jest.fn(() =>
        Promise.resolve({
          data: testingMembers.slice(0, 3),
          reconciliateFn: jest.fn(() => Promise.resolve()),
        })
      ),
      createTimeTableSheet: jest.fn(() =>
        Promise.resolve({
          data: [],
          reconciliateFn: reconciliateReservations,
        })
      ),
    };

    const clock = {
      getFullDateArray: jest.fn(() => [2020, 11, 23, 21, 15]),
    };
    const admin = new SheetsAdmin({ sheetsAPI, db, clock });

    beforeEach(async () => {
      await db.clear();
    });

    describe("without flags", () => {
      beforeAll(async () => {
        sheetsAPI.createTimeTableSheet.mockClear();
        reconciliateReservations.mockClear();

        await admin.createTimeTableSheet({});
      });

      it("calls sheetsAPI.createTimeTableSheet with the correct titles", async () => {
        expect(sheetsAPI.createTimeTableSheet).toHaveBeenCalledTimes(1);
        expect(sheetsAPI.createTimeTableSheet).toHaveBeenCalledWith("DIC-2020");
      });

      it("calls reconciliateFn with the full generated timetable", async () => {
        expect(reconciliateReservations).toHaveBeenCalledTimes(1);

        const timeTable = reconciliateReservations.mock.calls[0][0];
        expect(timeTable).toHaveLength(81); // (31 - 4) * 3
        expect(timeTable).toMatchSnapshot();
      });
    });

    describe("with the this-month flag", () => {
      beforeAll(async () => {
        sheetsAPI.createTimeTableSheet.mockClear();
        reconciliateReservations.mockClear();

        await admin.createTimeTableSheet({ ["this-month"]: true });
      });

      it("calls sheetsAPI.createTimeTableSheet with the correct titles", async () => {
        expect(sheetsAPI.createTimeTableSheet).toHaveBeenCalledTimes(1);
        expect(sheetsAPI.createTimeTableSheet).toHaveBeenCalledWith("NOV-2020");
      });

      it("calls reconciliateFn with the full generated timetable", async () => {
        expect(reconciliateReservations).toHaveBeenCalledTimes(1);

        const timeTable = reconciliateReservations.mock.calls[0][0];
        expect(timeTable).toHaveLength(75); // (30 - 5) * 3
      });
    });
  });
});

describe("removeMember", () => {
  describe("happy path with two timetables", () => {
    const reconciliateMembers = jest.fn(() => Promise.resolve());
    const reconciliateReservationsDec = jest.fn(() => Promise.resolve());
    const reconciliateReservationsJan = jest.fn(() => Promise.resolve());
    const sheetsAPI = {
      loadMembers: jest.fn(() =>
        Promise.resolve({
          data: testingMembers,
          reconciliateFn: reconciliateMembers,
        })
      ),
      loadReservations: jest.fn((sheetTitle) => {
        if (sheetTitle == "DIC-2020")
          return Promise.resolve({
            data: [
              {
                miembro: "jeff",
                dia: "26-Sáb",
                hora: "18:00",
              },
              {
                miembro: "ben",
                dia: "26-Sáb",
                hora: "18:00",
              },
              {
                miembro: "jeff",
                dia: "28-Lun",
                hora: "18:00",
              },
              {
                miembro: "ben",
                dia: "28-Lun",
                hora: "18:00",
              },
              {
                miembro: "jeff",
                dia: "29-Mar",
                hora: "06:00",
              },
              {
                miembro: "ben",
                dia: "29-Mar",
                hora: "18:00",
              },
            ],
            reconciliateFn: reconciliateReservationsDec,
          });
        if (sheetTitle == "ENE-2021")
          return Promise.resolve({
            data: [
              {
                miembro: "ben",
                dia: "26-Sáb",
                hora: "18:00",
              },
              {
                miembro: "jeff",
                dia: "01-Vie",
                hora: "18:00",
              },
              {
                miembro: "ben",
                dia: "01-Vie",
                hora: "18:00",
              },
            ],
            reconciliateFn: reconciliateReservationsJan,
          });
      }),
    };
    const clock = {
      getFullDateArray: jest.fn(() => [2020, 12, 28, 17, 15]),
    };
    const admin = new SheetsAdmin({ sheetsAPI, db, clock });

    beforeAll(async () => {
      return admin.removeMember({ id: "ben" });
    });

    it("should reconciliate members without the removed member", async () => {
      const expectedMembers = [...testingMembers];
      expectedMembers.splice(1, 1); // remove ben;

      expect(reconciliateMembers).toHaveBeenCalledTimes(1);
      expect(reconciliateMembers).toHaveBeenCalledWith(expectedMembers);
    });

    it("should reconciliate reservations without the removed members rows", async () => {
      expect(reconciliateReservationsDec).toHaveBeenCalledTimes(1);
      expect(reconciliateReservationsDec).toHaveBeenCalledWith([
        {
          miembro: "jeff",
          dia: "26-Sáb",
          hora: "18:00",
        },
        {
          miembro: "jeff",
          dia: "28-Lun",
          hora: "18:00",
        },
        {
          miembro: "jeff",
          dia: "29-Mar",
          hora: "06:00",
        },
      ]);

      expect(reconciliateReservationsJan).toHaveBeenCalledTimes(1);
      expect(reconciliateReservationsJan).toHaveBeenCalledWith([
        {
          miembro: "jeff",
          dia: "01-Vie",
          hora: "18:00",
        },
      ]);
    });
  });

  describe("happy path with one timetable", () => {
    const reconciliateMembers = jest.fn(() => Promise.resolve());
    const reconciliateReservations = jest.fn(() => Promise.resolve());
    const sheetsAPI = {
      loadMembers: jest.fn(() =>
        Promise.resolve({
          data: testingMembers,
          reconciliateFn: reconciliateMembers,
        })
      ),
      loadReservations: jest.fn((sheetTitle) => {
        if (sheetTitle == "DIC-2020")
          return Promise.resolve({
            data: [
              {
                miembro: "jeff",
                dia: "28-Lun",
                hora: "18:00",
              },
              {
                miembro: "ben",
                dia: "28-Lun",
                hora: "18:00",
              },
              {
                miembro: "jeff",
                dia: "29-Mar",
                hora: "06:00",
              },
              {
                miembro: "ben",
                dia: "29-Mar",
                hora: "18:00",
              },
            ],
            reconciliateFn: reconciliateReservations,
          });

        return Promise.resolve({ timeTableMissing: true });
      }),
    };
    const clock = {
      getFullDateArray: jest.fn(() => [2020, 12, 28, 17, 15]),
    };
    const admin = new SheetsAdmin({ sheetsAPI, db, clock });

    beforeAll(async () => {
      return admin.removeMember({ id: "ben" });
    });

    it("should reconciliate members without the removed member", async () => {
      const expectedMembers = [...testingMembers];
      expectedMembers.splice(1, 1); // remove ben;

      expect(reconciliateMembers).toHaveBeenCalledTimes(1);
      expect(reconciliateMembers).toHaveBeenCalledWith(expectedMembers);
    });

    it("should reconciliate reservations without the removed members rows", async () => {
      expect(reconciliateReservations).toHaveBeenCalledTimes(1);
      expect(reconciliateReservations).toHaveBeenCalledWith([
        {
          miembro: "jeff",
          dia: "28-Lun",
          hora: "18:00",
        },
        {
          miembro: "jeff",
          dia: "29-Mar",
          hora: "06:00",
        },
      ]);
    });
  });

  it("fails when member is not found", async () => {
    const sheetsAPI = {
      loadMembers: jest.fn(() =>
        Promise.resolve({
          data: testingMembers,
        })
      ),
    };
    const clock = {
      getFullDateArray: jest.fn(() => [2020, 11, 23, 21, 15]),
    };
    const admin = new SheetsAdmin({ sheetsAPI, db, clock });

    let error;
    try {
      await admin.removeMember({ id: "not_user" });
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error).toMatchSnapshot();
  });
});
