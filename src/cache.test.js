const { CacheReader, CacheWriter } = require("./cache.js");

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

describe("CacheReader", () => {
  describe("listHistory", () => {
    const storage = {
      listKeys: jest.fn(() =>
        Promise.resolve([
          "7baf000000",
          "1baf000000",
          "3aac000000",
          "2fd2000000",
        ])
      ),
      read: jest.fn(({ key }) => {
        const files = {
          ["7baf000000"]: {
            systemTime: 1000,
            type: "metadata",
            args: ["cmd", "one"],
          },
          ["1baf000000"]: {
            systemTime: 4000,
            type: "metadata",
            args: ["cmd", "two"],
          },
          ["3aac000000"]: {
            systemTime: 3000,
            type: "metadata",
            args: ["cmd", "three"],
          },
          ["2fd2000000"]: {
            systemTime: 2000,
            type: "metadata",
            args: ["cmd", "four"],
          },
        };
        return Promise.resolve(files[key]);
      }),
    };

    it("returns an array of history items sorted by system time", async () => {
      const cache = new CacheReader({ storage });
      const result = await cache.listHistory();

      expect(result).toEqual([
        {
          key: "7baf000000",
          systemTime: 1000,
          type: "metadata",
          args: ["cmd", "one"],
        },
        {
          key: "2fd2000000",
          systemTime: 2000,
          type: "metadata",
          args: ["cmd", "four"],
        },
        {
          key: "3aac000000",
          systemTime: 3000,
          type: "metadata",
          args: ["cmd", "three"],
        },
        {
          key: "1baf000000",
          systemTime: 4000,
          type: "metadata",
          args: ["cmd", "two"],
        },
      ]);
    });
  });
});
