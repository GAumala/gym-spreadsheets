const dbConnection = require("../db/connection.js");
const db = require("../db/queries.js");
const PromiseReporter = require("../reporter/PromiseReporter.js");
const SheetsAdmin = require("../SheetsAdmin.js");

const mockReporter = {
  report: jest.fn(),
  clear: jest.fn(),
};
const reporter = new PromiseReporter(mockReporter);

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

describe("rearrangeReservations", () => {
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
    const admin = new SheetsAdmin({ sheetsAPI, db, clock, reporter });

    let error;
    try {
      await admin.rearrangeReservations({
        member: "not_user",
        ["add-days"]: [],
        ["remove-days"]: [24, 25],
      });
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error).toMatchSnapshot();
  });

  it("fails when input is empty", async () => {
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
    const admin = new SheetsAdmin({ sheetsAPI, db, clock, reporter });

    let error;
    try {
      await admin.rearrangeReservations({
        member: "jeff",
        ["add-days"]: [],
        ["remove-days"]: [],
      });
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error).toMatchSnapshot();
  });

  describe("with only one timetable", () => {
    const reconciliateFn = jest.fn(() => Promise.resolve());
    const sheetsAPI = {
      loadMembers: jest.fn(() =>
        Promise.resolve({
          data: testingMembers,
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
            reconciliateFn,
          });

        return Promise.resolve({ timeTableMissing: true });
      }),
    };
    const clock = {
      getFullDateArray: jest.fn(() => [2020, 12, 27, 17, 15]),
    };

    describe("happy path rearranging reservations only in this month", () => {
      let res;
      beforeAll(async () => {
        reconciliateFn.mockClear();
        sheetsAPI.loadReservations.mockClear();

        const admin = new SheetsAdmin({ sheetsAPI, db, clock, reporter });
        res = await admin.rearrangeReservations({
          member: "jeff",
          ["add-days"]: ["29", "30", "08:00"],
          ["remove-days"]: ["28"],
        });
      });

      it("calls sheetsAPI.loadReservations only for current month", async () => {
        expect(sheetsAPI.loadReservations).toHaveBeenCalledTimes(1);
        expect(sheetsAPI.loadReservations).toHaveBeenCalledWith("DIC-2020");
      });

      it("returns a readable message listing the rearranged reservations", () => {
        expect(res).toBeDefined();
        expect(res.message).toMatchSnapshot();
      });

      it("calls reconciliateFn with the modified reservations", () => {
        expect(reconciliateFn).toHaveBeenCalledWith([
          {
            miembro: "ben",
            dia: "28-Lun",
            hora: "18:00",
          },
          {
            miembro: "jeff",
            dia: "29-Mar",
            hora: "08:00",
          },
          {
            miembro: "ben",
            dia: "29-Mar",
            hora: "18:00",
          },
          {
            miembro: "jeff",
            dia: "30-Mié",
            hora: "08:00",
          },
        ]);
      });
    });

    describe("happy path rearranging reservations only in next month", () => {
      let res;

      const myLoadReservationsMock = jest.fn((sheetTitle) => {
        if (sheetTitle == "ENE-2021")
          return Promise.resolve({
            data: [
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
              {
                miembro: "jeff",
                dia: "02-Sáb",
                hora: "06:00",
              },
              {
                miembro: "ben",
                dia: "02-Sáb",
                hora: "18:00",
              },
            ],
            reconciliateFn,
          });

        return Promise.resolve({ timeTableMissing: true });
      });

      beforeAll(async () => {
        reconciliateFn.mockClear();

        const admin = new SheetsAdmin({
          sheetsAPI: {
            ...sheetsAPI,
            loadReservations: myLoadReservationsMock,
          },
          db,
          clock,
          reporter,
        });
        res = await admin.rearrangeReservations({
          member: "ben",
          ["add-days"]: ["1", "3", "08:00"],
          ["remove-days"]: ["2"],
        });
      });

      it("calls sheetsAPI.loadReservations only for next month", async () => {
        expect(myLoadReservationsMock).toHaveBeenCalledTimes(1);
        expect(myLoadReservationsMock).toHaveBeenCalledWith("ENE-2021");
      });

      it("returns a readable message listing the rearranged reservations", () => {
        expect(res).toBeDefined();
        expect(res.message).toMatchSnapshot();
      });

      it("calls reconciliateFn with the modified reservations", () => {
        expect(reconciliateFn).toHaveBeenCalledWith([
          {
            miembro: "ben",
            dia: "01-Vie",
            hora: "08:00",
          },
          {
            miembro: "jeff",
            dia: "01-Vie",
            hora: "18:00",
          },

          {
            miembro: "jeff",
            dia: "02-Sáb",
            hora: "06:00",
          },
          {
            miembro: "ben",
            dia: "03-Dom",
            hora: "08:00",
          },
        ]);
      });
    });

    describe("happy path rearranging reservations in this month and next", () => {
      let res;

      beforeAll(async () => {
        reconciliateFn.mockClear();
        sheetsAPI.loadReservations.mockClear();
        const admin = new SheetsAdmin({ sheetsAPI, db, clock, reporter });
        res = await admin.rearrangeReservations({
          member: "ben",
          ["add-days"]: ["29", "30", "2", "08:00"],
          ["remove-days"]: ["28", "1"],
        });
      });

      it("returns a readable message using <SIN_HOJA> in reservations targeting next month", () => {
        expect(res).toBeDefined();
        expect(res.message).toMatchSnapshot();
      });

      it("calls reconciliateFn with the modified reservations", () => {
        expect(reconciliateFn).toHaveBeenCalledWith([
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
          {
            miembro: "ben",
            dia: "29-Mar",
            hora: "08:00",
          },
          {
            miembro: "ben",
            dia: "30-Mié",
            hora: "08:00",
          },
        ]);
      });

      it("calls sheetsAPI.loadReservations with the correct titles", async () => {
        expect(sheetsAPI.loadReservations).toHaveBeenCalledTimes(2);
        expect(sheetsAPI.loadReservations).toHaveBeenCalledWith("DIC-2020");
        expect(sheetsAPI.loadReservations).toHaveBeenCalledWith("ENE-2021");
      });
    });
  });

  describe("happy path with two timetable", () => {
    const reconciliateDicFn = jest.fn(() => Promise.resolve());
    const reconciliateJanFn = jest.fn(() => Promise.resolve());
    const sheetsAPI = {
      loadMembers: jest.fn(() =>
        Promise.resolve({
          data: testingMembers,
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
            reconciliateFn: reconciliateDicFn,
          });

        return Promise.resolve({
          data: [
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
            {
              miembro: "jeff",
              dia: "02-Sáb",
              hora: "06:00",
            },
            {
              miembro: "ben",
              dia: "02-Sáb",
              hora: "18:00",
            },
          ],
          reconciliateFn: reconciliateJanFn,
        });
      }),
    };
    const clock = {
      getFullDateArray: jest.fn(() => [2020, 12, 27, 17, 15]),
    };
    const admin = new SheetsAdmin({ sheetsAPI, db, clock, reporter });
    let res;

    beforeAll(async () => {
      res = await admin.rearrangeReservations({
        member: "ben",
        ["add-days"]: ["29", "30", "2", "08:00"],
        ["remove-days"]: ["28", "1"],
      });
    });

    it("returns a readable message with the modified reservations", () => {
      expect(res).toBeDefined();
      expect(res.message).toMatchSnapshot();
    });

    it("calls reconciliateFn with the modified reservations of this month", () => {
      expect(reconciliateDicFn).toHaveBeenCalledWith([
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
        {
          miembro: "ben",
          dia: "29-Mar",
          hora: "08:00",
        },
        {
          miembro: "ben",
          dia: "30-Mié",
          hora: "08:00",
        },
      ]);
    });

    it("calls reconciliateFn with the modified reservations of next month", () => {
      expect(reconciliateJanFn).toHaveBeenCalledWith([
        {
          miembro: "jeff",
          dia: "01-Vie",
          hora: "18:00",
        },
        {
          miembro: "jeff",
          dia: "02-Sáb",
          hora: "06:00",
        },
        {
          miembro: "ben",
          dia: "02-Sáb",
          hora: "08:00",
        },
      ]);
    });

    it("calls sheetsAPI.loadReservations with the correct titles", async () => {
      expect(sheetsAPI.loadReservations).toHaveBeenCalledTimes(2);
      expect(sheetsAPI.loadReservations).toHaveBeenCalledWith("DIC-2020");
      expect(sheetsAPI.loadReservations).toHaveBeenCalledWith("ENE-2021");
    });
  });

  describe("error path breaking reservation constraints with two timetables", () => {
    const reconciliateDicFn = jest.fn(() => Promise.resolve());
    const reconciliateJanFn = jest.fn(() => Promise.resolve());
    const sheetsAPI = {
      loadMembers: jest.fn(() =>
        Promise.resolve({
          data: testingMembers,
        })
      ),
      loadReservations: jest.fn((sheetTitle) => {
        if (sheetTitle == "DIC-2020")
          return Promise.resolve({
            data: [
              {
                miembro: "jeff",
                dia: "29-Mar",
                hora: "06:00",
              },
              {
                miembro: "ben",
                dia: "29-Mar",
                hora: "06:00",
              },
            ],
            reconciliateFn: reconciliateDicFn,
          });

        return Promise.resolve({
          data: [
            {
              miembro: "jeff",
              dia: "01-Vie",
              hora: "06:00",
            },
            {
              miembro: "ben",
              dia: "01-Vie",
              hora: "06:00",
            },
            {
              miembro: "jeff",
              dia: "02-Sáb",
              hora: "08:00",
            },
            {
              miembro: "ben",
              dia: "02-Sáb",
              hora: "06:00",
            },
            {
              miembro: "alex",
              dia: "02-Sáb",
              hora: "08:00",
            },
            {
              miembro: "paul",
              dia: "02-Sáb",
              hora: "08:00",
            },
            {
              miembro: "john",
              dia: "02-Sáb",
              hora: "08:00",
            },
            {
              miembro: "alice",
              dia: "02-Sáb",
              hora: "08:00",
            },
            {
              miembro: "jenny",
              dia: "02-Sáb",
              hora: "08:00",
            },
            {
              miembro: "fred",
              dia: "02-Sáb",
              hora: "08:00",
            },
            {
              miembro: "mary",
              dia: "02-Sáb",
              hora: "08:00",
            },
            {
              miembro: "kevin",
              dia: "02-Sáb",
              hora: "08:00",
            },
            {
              miembro: "bill",
              dia: "02-Sáb",
              hora: "08:00",
            },
          ],
          reconciliateFn: reconciliateJanFn,
        });
      }),
    };
    const clock = {
      getFullDateArray: jest.fn(() => [2020, 12, 27, 17, 15]),
    };
    const admin = new SheetsAdmin({ sheetsAPI, db, clock, reporter });
    let error;

    beforeAll(async () => {
      try {
        await admin.rearrangeReservations({
          member: "ben",
          ["add-days"]: ["29", "30", "2", "3", "08:00"],
          ["remove-days"]: ["28", "1"],
        });
      } catch (e) {
        error = e;
      }
    });

    it("throws an error with readable message explaining the problem", () => {
      expect(error).toBeDefined();
      expect(error.message).toMatchSnapshot();
    });

    it("Does not call reconciliateFn at all", () => {
      expect(reconciliateDicFn).not.toHaveBeenCalled();
      expect(reconciliateJanFn).not.toHaveBeenCalled();
    });
  });
});
