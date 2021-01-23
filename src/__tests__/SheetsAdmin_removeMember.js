const dbConnection = require("../db.js");
const db = require("../db/queries.js");
const SheetsAdmin = require("../SheetsAdmin.js");

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
