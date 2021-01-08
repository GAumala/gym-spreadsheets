const { CacheWriter } = require("./cache.js");

describe("CacheWriter", () => {
  const systemTime = 1607380793884;
  const args = ["reservations", "list", "--hour", "17:00"];

  describe("writeMembersSheet", () => {
    const storage = {
      write: jest.fn(() => Promise.resolve()),
    };
    const cache = new CacheWriter({ storage, systemTime, args });

    beforeAll(() => {
      const headerValues = ["ID", "NOMBRE", "HORARIO", "COMENTARIOS"];
      const data = [
        { id: "jeff", nombre: "Jeff", horario: "09:00", comentarios: "foo" },
        {
          id: "alice",
          nombre: "Alice",
          horario: "17:00",
          comentarios: "bar xyz",
        },
      ];

      return cache.writeMembersSheet({ headerValues, data });
    });

    it("should write two json documents", () => {
      expect(storage.write).toHaveBeenCalledTimes(2);
    });

    it("should write metadata document", () => {
      expect(storage.write).toHaveBeenCalledWith({
        storageDir: expect.stringMatching(/\.cache$/),
        key: "2e16ddb31f",
        fileName: "metadata.json",
        value: {
          args: ["reservations", "list", "--hour", "17:00"],
          systemTime: 1607380793884,
          type: "metadata",
        },
      });
    });

    it("should write members document", () => {
      expect(storage.write).toHaveBeenCalledWith({
        storageDir: expect.stringMatching(/\.cache$/),
        key: "2e16ddb31f",
        fileName: "members.json",
        value: {
          type: "members",
          headerValues: ["ID", "NOMBRE", "HORARIO", "COMENTARIOS"],
          data: [
            {
              id: "jeff",
              nombre: "Jeff",
              horario: "09:00",
              comentarios: "foo",
            },
            {
              id: "alice",
              nombre: "Alice",
              horario: "17:00",
              comentarios: "bar xyz",
            },
          ],
        },
      });
    });
  });

  describe("writeReservationsSheet", () => {
    const storage = {
      write: jest.fn(() => Promise.resolve()),
    };
    const cache = new CacheWriter({ storage, systemTime, args });

    beforeAll(() => {
      const sheetTitle = "NOV-2020";
      const headerValues = ["MIEMBRO", "DÍA", "HORA"];
      const data = [
        { miembro: "jeff", dia: "01-Mar", hora: "09:00" },
        { miembro: "alice", dia: "02-Mié", hora: "17:00" },
      ];

      return cache.writeReservationsSheet({ headerValues, data, sheetTitle });
    });

    it("should write two json documents", () => {
      expect(storage.write).toHaveBeenCalledTimes(2);
    });

    it("should write metadata document", () => {
      expect(storage.write).toHaveBeenCalledWith({
        storageDir: expect.stringMatching(/\.cache$/),
        key: "2e16ddb31f",
        fileName: "metadata.json",
        value: {
          args: ["reservations", "list", "--hour", "17:00"],
          systemTime: 1607380793884,
          type: "metadata",
        },
      });
    });

    it("should write members document", () => {
      expect(storage.write).toHaveBeenCalledWith({
        storageDir: expect.stringMatching(/\.cache$/),
        key: "2e16ddb31f",
        fileName: "reservations-NOV-2020.json",
        value: {
          type: "reservations",
          sheetTitle: "NOV-2020",
          headerValues: ["MIEMBRO", "DÍA", "HORA"],
          data: [
            { miembro: "jeff", dia: "01-Mar", hora: "09:00" },
            { miembro: "alice", dia: "02-Mié", hora: "17:00" },
          ],
        },
      });
    });
  });

  describe("writeNewTimeTableSheetTitle", () => {
    const storage = {
      write: jest.fn(() => Promise.resolve()),
    };
    const cache = new CacheWriter({
      storage,
      systemTime,
      args: ["reservations", "create-sheet"],
    });

    beforeAll(() => {
      const sheetTitle = "DIC-2020";
      return cache.writeNewTimeTableSheetTitle({ sheetTitle });
    });

    it("should write two json documents", () => {
      expect(storage.write).toHaveBeenCalledTimes(2);
    });

    it("should write metadata document", () => {
      expect(storage.write).toHaveBeenCalledWith({
        storageDir: expect.stringMatching(/\.cache$/),
        key: "2e16ddb31f",
        fileName: "metadata.json",
        value: {
          args: ["reservations", "create-sheet"],
          systemTime: 1607380793884,
          type: "metadata",
        },
      });
    });

    it("should write new timetable document", () => {
      expect(storage.write).toHaveBeenCalledWith({
        storageDir: expect.stringMatching(/\.cache$/),
        key: "2e16ddb31f",
        fileName: "new-timetable-DIC-2020.json",
        value: {
          type: "new-timetable",
          sheetTitle: "DIC-2020",
        },
      });
    });
  });
});
