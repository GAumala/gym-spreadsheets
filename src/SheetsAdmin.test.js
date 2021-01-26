const dbConnection = require("./db.js");
const db = require("./db/queries.js");
const PromiseReporter = require("./reporter/PromiseReporter.js");
const SheetsAdmin = require("./SheetsAdmin.js");

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
    const admin = new SheetsAdmin({ sheetsAPI, db, clock, reporter });

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
    const admin = new SheetsAdmin({ sheetsAPI, db, clock, reporter });

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

describe("cleanReservations", () => {
  const reconciliateFn = jest.fn(() => Promise.resolve());
  const reservations = [
    {
      miembro: "jeff",
      dia: "20-Vie",
      hora: "17:00",
    },
    {
      miembro: "ben",
      dia: "20-Vie",
      hora: "17:00",
    },
    {
      miembro: "jeff",
      dia: "23-Lun",
      hora: "17:00",
    },
    {
      miembro: "ben",
      dia: "23-Lun",
      hora: "17:00",
    },
    {
      miembro: "jeff",
      dia: "24-Mar",
      hora: "17:00",
    },
    {
      miembro: "ben",
      dia: "24-Mar",
      hora: "17:00",
    },
  ];
  const sheetsAPI = {
    loadMembers: jest.fn(() =>
      Promise.resolve({
        data: testingMembers.slice(0, 3),
      })
    ),
    loadReservations: jest.fn((sheetTitle) => {
      if (sheetTitle === "NOV-2020")
        return Promise.resolve({
          data: reservations,
          reconciliateFn,
        });

      return Promise.resolve({ timeTableMissing: true });
    }),
  };

  const clock = {
    getFullDateArray: jest.fn(() => [2020, 11, 23, 21, 15]),
  };

  beforeEach(() => {
    reconciliateFn.mockClear();
  });

  it("removes reservations from before the current day", async () => {
    const admin = new SheetsAdmin({ sheetsAPI, db, clock, reporter });
    const res = await admin.cleanReservations();

    expect(res.data).toEqual(2);
    expect(reconciliateFn).toHaveBeenCalledWith([
      {
        miembro: "jeff",
        dia: "23-Lun",
        hora: "17:00",
      },
      {
        miembro: "ben",
        dia: "23-Lun",
        hora: "17:00",
      },
      {
        miembro: "jeff",
        dia: "24-Mar",
        hora: "17:00",
      },
      {
        miembro: "ben",
        dia: "24-Mar",
        hora: "17:00",
      },
    ]);
  });
  it("removes reservations for deleted members", async () => {
    const unknownMemberReservations = [
      {
        miembro: "unknown1",
        dia: "23-Lun",
        hora: "17:00",
      },
      {
        miembro: "unknown2",
        dia: "23-Lun",
        hora: "17:00",
      },
    ];

    const alteredSheetsAPI = {
      ...sheetsAPI,
      loadReservations: jest.fn((sheetTitle) => {
        if (sheetTitle === "NOV-2020")
          return Promise.resolve({
            data: reservations.concat(unknownMemberReservations),
            reconciliateFn,
          });

        return Promise.resolve({ timeTableMissing: true });
      }),
    };

    const admin = new SheetsAdmin({
      sheetsAPI: alteredSheetsAPI,
      db,
      clock,
      reporter,
    });
    const res = await admin.cleanReservations();

    expect(res.data).toEqual(4);
    expect(reconciliateFn).toHaveBeenCalledWith([
      {
        miembro: "jeff",
        dia: "23-Lun",
        hora: "17:00",
      },
      {
        miembro: "ben",
        dia: "23-Lun",
        hora: "17:00",
      },
      {
        miembro: "jeff",
        dia: "24-Mar",
        hora: "17:00",
      },
      {
        miembro: "ben",
        dia: "24-Mar",
        hora: "17:00",
      },
    ]);
  });
});
