const dbConnection = require("../db.js");
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
              dia: "25-Lun",
              hora: "06:00",
            },
            {
              miembro: "ben",
              dia: "25-Lun",
              hora: "06:00",
            },
            {
              miembro: "paul",
              dia: "25-Lun",
              hora: "07:00",
            },
            {
              miembro: "alex",
              dia: "25-Lun",
              hora: "07:00",
            },
            {
              miembro: "jeff",
              dia: "26-Mar",
              hora: "06:00",
            },
            {
              miembro: "ben",
              dia: "26-Mar",
              hora: "18:00",
            },
            {
              miembro: "paul",
              dia: "26-Mar",
              hora: "19:00",
            },
          ],
          reconciliateFn: reconciliateReservations,
        })
      ),
    };
    const clock = {
      getFullDateArray: jest.fn(() => [2021, 1, 23, 21, 0]),
    };
    const admin = new SheetsAdmin({ sheetsAPI, db, clock, reporter });

    let res;
    beforeAll(async () => {
      await db.clear();
      res = await admin.listMembersThatReservedAtTime({});
    });

    it("calls sheetsAPI.loadReservations with the current month title", async () => {
      expect(sheetsAPI.loadReservations).toHaveBeenCalledTimes(1);
      expect(sheetsAPI.loadReservations).toHaveBeenCalledWith("ENE-2021");
    });

    it("returns a readable message with member names", async () => {
      expect(res.message).toMatchSnapshot();
    });
  });

  describe("happy path with different argument combinations", () => {
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
    const admin = new SheetsAdmin({ sheetsAPI, db, clock, reporter });

    beforeAll(async () => {
      await db.clear();
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

  describe("error path with no reservations", () => {
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
          data: [],
          reconciliateFn: reconciliateReservations,
        })
      ),
    };
    const clock = {
      getFullDateArray: jest.fn(() => [2020, 11, 23, 17, 15]),
    };
    const admin = new SheetsAdmin({ sheetsAPI, db, clock, reporter });

    let res;

    beforeAll(async () => {
      await db.clear();

      res = await admin.listMembersThatReservedAtTime({});
    });

    it("returns a nice error msg", () => {
      expect(res).toBeDefined();
      expect(res.message).toMatchSnapshot();
    });

    it("calls sheetsAPI.loadReservations with the current month title", async () => {
      expect(sheetsAPI.loadReservations).toHaveBeenCalledTimes(1);
      expect(sheetsAPI.loadReservations).toHaveBeenCalledWith("NOV-2020");
    });
  });
});
