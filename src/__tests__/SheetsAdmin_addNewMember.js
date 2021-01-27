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
    const admin = new SheetsAdmin({ sheetsAPI, db, clock, reporter });

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
    const admin = new SheetsAdmin({ sheetsAPI, db, clock, reporter });

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

  describe("when id conflicts arise", () => {
    const reconciliateMembers = jest.fn(() => Promise.resolve());
    const sheetsAPI = {
      loadMembers: jest.fn(() =>
        Promise.resolve({
          data: testingMembers,
          reconciliateFn: reconciliateMembers,
        })
      ),
    };
    const clock = {
      getFullDateArray: jest.fn(() => [2020, 11, 25, 0, 0]),
    };
    const admin = new SheetsAdmin({ sheetsAPI, db, clock, reporter });
    let error;

    beforeAll(async () => {
      await db.clear();
      try {
        await admin.addNewMember({ name: "Jeff", hour: "17:00" });
      } catch (e) {
        error = e;
      }
    });

    it("throws a readable error", async () => {
      expect(error).toBeDefined();
      expect(error).toMatchSnapshot();
    });

    it("does not reconciliate members", async () => {
      expect(reconciliateMembers).not.toHaveBeenCalled();
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
    const admin = new SheetsAdmin({ sheetsAPI, db, clock, reporter });

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
