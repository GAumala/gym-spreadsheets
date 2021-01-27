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
    const admin = new SheetsAdmin({ sheetsAPI, db, clock, reporter });

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
    const admin = new SheetsAdmin({ sheetsAPI, db, clock, reporter });
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
    const admin = new SheetsAdmin({ sheetsAPI, db, clock, reporter });

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
    const admin = new SheetsAdmin({ sheetsAPI, db, clock, reporter });

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
