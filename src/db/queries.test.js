const db = require("../db.js");
const q = require("./queries.js");

const getAllMembers = () => db.select("*").from("miembro");
const getAllReservations = () => db.select("*").from("reservacion");

afterAll(() => db.destroy());

describe("findMiembroById", () => {
  beforeEach(() => q.clear());

  it("returns inserted rows", async () => {
    const row = {
      id: "viviana_ruiz",
      nombre: "Viviana Ruiz",
      email: "vruiz@mail.com",
      entrada: "10:00",
      notas: "",
    };
    await q.insertMiembro(row);

    const expected = { ...row, rowid: expect.any(Number) };
    const result = await q.findMiembroById("viviana_ruiz");
    expect(result).toEqual(expected);
  });

  it("returns undefined if member does not exist", async () => {
    const result = await q.findMiembroById("no_existe");
    expect(result).toBeUndefined();
  });
});

describe("createMonthReservations", () => {
  beforeAll(async () => {
    await q.clear();

    const miembros = [
      {
        id: "jeff",
        nombre: "Jeff",
        email: "",
        entrada: "06:00",
        notas: "",
      },
      {
        id: "tom",
        nombre: "Tom",
        email: "",
        entrada: "06:00",
        notas: "",
      },
      {
        id: "bill",
        nombre: "Bill",
        email: "",
        entrada: "07:00",
        notas: "",
      },
      {
        id: "harry",
        nombre: "Harry",
        email: "",
        entrada: "07:00",
        notas: "",
      },
    ];
    await q.insertMiembro(miembros);
  });

  it("returns correct reservaciontion rows", async () => {
    const monthSlots = [
      { dia: "01-Lun", hora: "06:00" },
      { dia: "01-Lun", hora: "07:00" },
      { dia: "01-Lun", hora: "08:00" },
      { dia: "01-Lun", hora: "09:30" },
      { dia: "02-Mar", hora: "06:00" },
      { dia: "02-Mar", hora: "07:00" },
      { dia: "02-Mar", hora: "08:00" },
      { dia: "02-Mar", hora: "09:30" },
    ];

    const expected = [
      { dia: "01-Lun", hora: "06:00", miembro: "jeff" },
      { dia: "01-Lun", hora: "06:00", miembro: "tom" },
      { dia: "01-Lun", hora: "07:00", miembro: "bill" },
      { dia: "01-Lun", hora: "07:00", miembro: "harry" },
      { dia: "02-Mar", hora: "06:00", miembro: "jeff" },
      { dia: "02-Mar", hora: "06:00", miembro: "tom" },
      { dia: "02-Mar", hora: "07:00", miembro: "bill" },
      { dia: "02-Mar", hora: "07:00", miembro: "harry" },
    ];
    const reservaciontions = await q.createMonthReservations(monthSlots);
    expect(reservaciontions).toEqual(expected);
  });
});

describe("setMemberRows", () => {
  beforeEach(async () => {
    await q.clear();
  });

  it("inserts rows", async () => {
    const miembros = [
      {
        id: "jeff",
        nombre: "Jeff",
        email: "",
        entrada: "07:00",
        notas: "",
      },
      {
        id: "tom",
        nombre: "Tom",
        email: "",
        entrada: "07:00",
        notas: "",
      },
      {
        id: "alice",
        nombre: "Alice",
        email: "",
        entrada: "08:00",
        notas: "",
      },
    ];

    await q.setMemberRows(miembros);
    const insertedRows = await getAllMembers();
    expect(insertedRows).toHaveLength(3);
  });

  it("throws FatalError if there are too many members with same entrada", async () => {
    const miembros = [
      {
        id: "jeff",
        nombre: "Jeff",
        email: "",
        entrada: "07:00",
        notas: "",
      },
      {
        id: "tom",
        nombre: "Tom",
        email: "",
        entrada: "07:00",
        notas: "",
      },
      {
        id: "bill",
        nombre: "Bill",
        email: "",
        entrada: "07:00",
        notas: "",
      },
      {
        id: "harry",
        nombre: "Harry",
        email: "",
        entrada: "07:00",
        notas: "",
      },
      {
        id: "alex",
        nombre: "Alex",
        email: "",
        entrada: "07:00",
        notas: "",
      },
      {
        id: "jenny",
        nombre: "Jenny",
        email: "",
        entrada: "07:00",
        notas: "",
      },
      {
        id: "dave",
        nombre: "Dave",
        email: "",
        entrada: "07:00",
        notas: "",
      },
      {
        id: "charlie",
        nombre: "Charlie",
        email: "",
        entrada: "07:00",
        notas: "",
      },
      {
        id: "fred",
        nombre: "Fred",
        email: "",
        entrada: "07:00",
        notas: "",
      },
      {
        id: "willy",
        nombre: "Willy",
        email: "",
        entrada: "07:00",
        notas: "",
      },
      {
        id: "kenny",
        nombre: "Kenny",
        email: "",
        entrada: "07:00",
        notas: "",
      },
      {
        id: "alice",
        nombre: "Alice",
        email: "",
        entrada: "08:00",
        notas: "",
      },
    ];

    let thrownError;
    try {
      await q.setMemberRows(miembros);
    } catch (e) {
      thrownError = e;
    }
    expect(thrownError).toMatchSnapshot();
  });
});

describe("setReservationRows", () => {
  beforeEach(async () => {
    await q.clear();

    const miembros = [
      {
        id: "jeff",
        nombre: "Jeff",
        email: "",
        entrada: "07:00",
        notas: "",
      },
      {
        id: "tom",
        nombre: "Tom",
        email: "",
        entrada: "07:00",
        notas: "",
      },
      {
        id: "bill",
        nombre: "Bill",
        email: "",
        entrada: "07:00",
        notas: "",
      },
      {
        id: "harry",
        nombre: "Harry",
        email: "",
        entrada: "07:00",
        notas: "",
      },
      {
        id: "alex",
        nombre: "Alex",
        email: "",
        entrada: "07:00",
        notas: "",
      },
      {
        id: "jenny",
        nombre: "Jenny",
        email: "",
        entrada: "07:00",
        notas: "",
      },
      {
        id: "dave",
        nombre: "Dave",
        email: "",
        entrada: "07:00",
        notas: "",
      },
      {
        id: "charlie",
        nombre: "Charlie",
        email: "",
        entrada: "07:00",
        notas: "",
      },
      {
        id: "fred",
        nombre: "Fred",
        email: "",
        entrada: "08:00",
        notas: "",
      },
      {
        id: "willy",
        nombre: "Willy",
        email: "",
        entrada: "08:00",
        notas: "",
      },
      {
        id: "kenny",
        nombre: "Kenny",
        email: "",
        entrada: "08:00",
        notas: "",
      },
      {
        id: "alice",
        nombre: "Alice",
        email: "",
        entrada: "08:00",
        notas: "",
      },
    ];

    await q.setMemberRows(miembros);
  });

  it("inserts rows", async () => {
    const reservaciones = [
      {
        miembro: "jeff",
        dia: "26-Jue",
        hora: "07:00",
      },
      {
        miembro: "tom",
        dia: "26-Jue",
        hora: "07:00",
      },
      {
        miembro: "alice",
        dia: "26-Jue",
        hora: "08:00",
      },
    ];

    await q.setReservationRows(reservaciones);
    const insertedRows = await getAllReservations();
    expect(insertedRows).toHaveLength(3);
  });

  it("handles empty array parameter", async () => {
    await q.setReservationRows([]);
    const insertedRows = await getAllReservations();
    expect(insertedRows).toHaveLength(0);
  });

  it("throws FatalError if there are too many reservaciontions at the same slot", async () => {
    const reservaciones = [
      {
        miembro: "jeff",
        dia: "26-Jue",
        hora: "07:00",
      },
      {
        miembro: "tom",
        dia: "26-Jue",
        hora: "07:00",
      },
      {
        miembro: "harry",
        dia: "26-Jue",
        hora: "07:00",
      },
      {
        miembro: "bill",
        dia: "26-Jue",
        hora: "07:00",
      },
      {
        miembro: "jenny",
        dia: "26-Jue",
        hora: "07:00",
      },
      {
        miembro: "alex",
        dia: "26-Jue",
        hora: "07:00",
      },
      {
        miembro: "dave",
        dia: "26-Jue",
        hora: "07:00",
      },
      {
        miembro: "charlie",
        dia: "26-Jue",
        hora: "07:00",
      },
      {
        miembro: "fred",
        dia: "26-Jue",
        hora: "07:00",
      },
      {
        miembro: "willy",
        dia: "26-Jue",
        hora: "07:00",
      },
      {
        miembro: "kenny",
        dia: "26-Jue",
        hora: "07:00",
      },
      {
        miembro: "alice",
        dia: "26-Jue",
        hora: "08:00",
      },
    ];

    let thrownError;
    try {
      await q.setReservationRows(reservaciones);
    } catch (e) {
      thrownError = e;
    }
    expect(thrownError).toMatchSnapshot();
  });
});

describe("updateReservationsWithNewMember", () => {
  beforeEach(async () => {
    await q.clear();

    const miembros = [
      {
        id: "jeff",
        nombre: "Jeff",
        email: "",
        entrada: "07:00",
        notas: "",
      },
      {
        id: "tom",
        nombre: "Tom",
        email: "",
        entrada: "07:00",
        notas: "",
      },
      {
        id: "bill",
        nombre: "Bill",
        email: "",
        entrada: "07:00",
        notas: "",
      },
      {
        id: "harry",
        nombre: "Harry",
        email: "",
        entrada: "07:00",
        notas: "",
      },
      {
        id: "alex",
        nombre: "Alex",
        email: "",
        entrada: "07:00",
        notas: "",
      },
      {
        id: "jenny",
        nombre: "Jenny",
        email: "",
        entrada: "07:00",
        notas: "",
      },
      {
        id: "dave",
        nombre: "Dave",
        email: "",
        entrada: "07:00",
        notas: "",
      },
      {
        id: "charlie",
        nombre: "Charlie",
        email: "",
        entrada: "07:00",
        notas: "",
      },
      {
        id: "fred",
        nombre: "Fred",
        email: "",
        entrada: "08:00",
        notas: "",
      },
      {
        id: "willy",
        nombre: "Willy",
        email: "",
        entrada: "08:00",
        notas: "",
      },
      {
        id: "kenny",
        nombre: "Kenny",
        email: "",
        entrada: "08:00",
        notas: "",
      },
      {
        id: "alice",
        nombre: "Alice",
        email: "",
        entrada: "08:00",
        notas: "",
      },
    ];

    await q.setMemberRows(miembros);
  });

  it("returns empty unavailableDays if there are no conflicts", async () => {
    const newMiembro = { id: "jeff", entrada: "07:00" };
    const slots = [
      {
        dia: "26-Jue",
        hora: "07:00",
      },
      {
        dia: "27-Vie",
        hora: "07:00",
      },
      {
        dia: "28-Sáb",
        hora: "07:00",
      },
    ];

    const {
      newData,
      unavailableDays,
    } = await q.updateReservationsWithNewMember(newMiembro, slots);
    expect(newData).toHaveLength(3);
    expect(unavailableDays).toHaveLength(0);
  });

  it("returns days with conflicts in unavailableDays array", async () => {
    const reservaciones = [
      {
        miembro: "jeff",
        dia: "26-Jue",
        hora: "07:00",
      },
      {
        miembro: "tom",
        dia: "26-Jue",
        hora: "07:00",
      },
      {
        miembro: "harry",
        dia: "26-Jue",
        hora: "07:00",
      },
      {
        miembro: "bill",
        dia: "26-Jue",
        hora: "07:00",
      },
      {
        miembro: "jenny",
        dia: "26-Jue",
        hora: "07:00",
      },
      {
        miembro: "alex",
        dia: "26-Jue",
        hora: "07:00",
      },
      {
        miembro: "dave",
        dia: "26-Jue",
        hora: "07:00",
      },
      {
        miembro: "charlie",
        dia: "26-Jue",
        hora: "07:00",
      },
      {
        miembro: "fred",
        dia: "26-Jue",
        hora: "07:00",
      },
      {
        miembro: "willy",
        dia: "26-Jue",
        hora: "07:00",
      },
    ];
    await q.setReservationRows(reservaciones);

    const newMiembro = { id: "kenny", entrada: "07:00" };
    const slots = [
      {
        dia: "26-Jue",
        hora: "07:00",
      },
      {
        dia: "27-Vie",
        hora: "07:00",
      },
      {
        dia: "28-Sáb",
        hora: "07:00",
      },
    ];

    const {
      newData,
      unavailableDays,
    } = await q.updateReservationsWithNewMember(newMiembro, slots);
    expect(newData).toHaveLength(12);
    expect(unavailableDays).toEqual(["26-Jue"]);
  });
});

describe("rearrangeReservationRows", () => {
  beforeEach(async () => {
    await q.clear();

    const miembros = [
      {
        id: "jeff",
        nombre: "Jeff",
        email: "",
        entrada: "07:00",
        notas: "",
      },
      {
        id: "tom",
        nombre: "Tom",
        email: "",
        entrada: "07:00",
        notas: "",
      },
      {
        id: "alex",
        nombre: "Alex",
        email: "",
        entrada: "18:00",
        notas: "",
      },
    ];

    const reservaciones = [
      {
        miembro: "jeff",
        dia: "28-Lun",
        hora: "07:00",
      },
      {
        miembro: "tom",
        dia: "28-Lun",
        hora: "07:00",
      },
      {
        miembro: "jeff",
        dia: "29-Mar",
        hora: "07:00",
      },
      {
        miembro: "tom",
        dia: "29-Mar",
        hora: "07:00",
      },
      {
        miembro: "jeff",
        dia: "30-Mié",
        hora: "07:00",
      },
      {
        miembro: "tom",
        dia: "30-Mié",
        hora: "07:00",
      },
      {
        miembro: "jeff",
        dia: "31-Jue",
        hora: "07:00",
      },
      {
        miembro: "tom",
        dia: "31-Jue",
        hora: "07:00",
      },
    ];

    await q.setMemberRows(miembros);
    await q.setReservationRows(reservaciones);
  });

  it("can rearrange with deletes only", async () => {
    const rearrangements = {
      member: "jeff",
      daysToRearrange: ["29-Mar", "30-Mié", "31-Jue"],
      slotsToAdd: [],
    };

    const res = await q.rearrangeReservationRows(rearrangements);
    expect(res).toEqual({
      rows: [
        {
          miembro: "jeff",
          dia: "28-Lun",
          hora: "07:00",
        },
        {
          miembro: "tom",
          dia: "28-Lun",
          hora: "07:00",
        },
        {
          miembro: "tom",
          dia: "29-Mar",
          hora: "07:00",
        },
        {
          miembro: "tom",
          dia: "30-Mié",
          hora: "07:00",
        },
        {
          miembro: "tom",
          dia: "31-Jue",
          hora: "07:00",
        },
      ],
      rearrangedSlots: [
        {
          dia: "29-Mar",
          deleted: true,
        },
        {
          dia: "30-Mié",
          deleted: true,
        },
        {
          dia: "31-Jue",
          deleted: true,
        },
      ],
    });
  });

  it("can rearrange adding and deleting", async () => {
    const rearrangements = {
      member: "jeff",
      daysToRearrange: ["29-Mar", "30-Mié", "31-Jue"],
      slotsToAdd: [
        {
          dia: "29-Mar",
          hora: "18:00",
        },
        {
          dia: "30-Mié",
          hora: "18:00",
        },
      ],
    };

    const res = await q.rearrangeReservationRows(rearrangements);
    expect(res).toEqual({
      rows: [
        {
          miembro: "jeff",
          dia: "28-Lun",
          hora: "07:00",
        },
        {
          miembro: "tom",
          dia: "28-Lun",
          hora: "07:00",
        },
        {
          miembro: "tom",
          dia: "29-Mar",
          hora: "07:00",
        },
        {
          miembro: "jeff",
          dia: "29-Mar",
          hora: "18:00",
        },
        {
          miembro: "tom",
          dia: "30-Mié",
          hora: "07:00",
        },
        {
          miembro: "jeff",
          dia: "30-Mié",
          hora: "18:00",
        },
        {
          miembro: "tom",
          dia: "31-Jue",
          hora: "07:00",
        },
      ],
      rearrangedSlots: [
        {
          dia: "29-Mar",
          hora: "18:00",
        },
        {
          dia: "30-Mié",
          hora: "18:00",
        },
        {
          dia: "31-Jue",
          deleted: true,
        },
      ],
    });
  });

  it("can rearrange with member with no reservations", async () => {
    const rearrangements = {
      member: "alex",
      daysToRearrange: ["29-Mar", "30-Mié", "31-Jue"],
      slotsToAdd: [
        {
          dia: "29-Mar",
          hora: "18:00",
        },
      ],
    };

    const res = await q.rearrangeReservationRows(rearrangements);
    expect(res).toEqual({
      rows: [
        {
          miembro: "jeff",
          dia: "28-Lun",
          hora: "07:00",
        },
        {
          miembro: "tom",
          dia: "28-Lun",
          hora: "07:00",
        },
        {
          miembro: "jeff",
          dia: "29-Mar",
          hora: "07:00",
        },
        {
          miembro: "tom",
          dia: "29-Mar",
          hora: "07:00",
        },
        {
          miembro: "alex",
          dia: "29-Mar",
          hora: "18:00",
        },
        {
          miembro: "jeff",
          dia: "30-Mié",
          hora: "07:00",
        },
        {
          miembro: "tom",
          dia: "30-Mié",
          hora: "07:00",
        },
        {
          miembro: "jeff",
          dia: "31-Jue",
          hora: "07:00",
        },
        {
          miembro: "tom",
          dia: "31-Jue",
          hora: "07:00",
        },
      ],
      rearrangedSlots: [
        {
          dia: "29-Mar",
          hora: "18:00",
        },
        {
          dia: "30-Mié",
          deleted: true,
        },
        {
          dia: "31-Jue",
          deleted: true,
        },
      ],
    });
  });
});
