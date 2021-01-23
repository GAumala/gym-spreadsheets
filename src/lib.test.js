const {
  createUserID,
  setMissingUserIDs,
  getRearrangementsByMonth,
} = require("./lib.js");

describe("createUserID", () => {
  it("removes accents and switches to lower case", () => {
    expect(createUserID("Jorge Cárdenas")).toBe("jorge_cardenas");
  });

  it("removes all special chars", () => {
    expect(createUserID("Jorge Cárdenas*")).toBe("jorge_cardenas");
  });

  it("removes extra white space", () => {
    expect(createUserID("\tVerónica  Muñoz  \r\n")).toBe("veronica_munoz");
  });
});

describe("setMissingUserIDs", () => {
  it("sets user id to the rows that don't have one in a new array", () => {
    const rows = [
      { nombre: "Julio Castro", id: "jcastro", email: "jcastro@mail.com" },
      { nombre: "Víctor Sánchez", email: "vsanchez@mail.com" },
      { nombre: "Eduardo Nuñez", email: "enunez@mail.com" },
    ];

    const expected = [
      { nombre: "Julio Castro", id: "jcastro", email: "jcastro@mail.com" },
      {
        nombre: "Víctor Sánchez",
        id: "victor_sanchez",
        email: "vsanchez@mail.com",
      },
      {
        nombre: "Eduardo Nuñez",
        id: "eduardo_nunez",
        email: "enunez@mail.com",
      },
    ];

    expect(setMissingUserIDs(rows)).toEqual(expected);
  });

  it("Handles users with same names", () => {
    const rows = [
      { nombre: "Jorge Martinez", email: "jmartinez@mail.com" },
      { nombre: "Víctor Sánchez", email: "vsanchez@mail.com" },
      { nombre: "Eduardo Nuñez", email: "enunez@mail.com" },
      { nombre: "Jorge Martinez" },
    ];

    const expected = [
      {
        nombre: "Jorge Martinez",
        id: "jorge_martinez",
        email: "jmartinez@mail.com",
      },
      {
        nombre: "Víctor Sánchez",
        id: "victor_sanchez",
        email: "vsanchez@mail.com",
      },
      {
        nombre: "Eduardo Nuñez",
        id: "eduardo_nunez",
        email: "enunez@mail.com",
      },
      { nombre: "Jorge Martinez", id: "jorge_martinez1" },
    ];
    expect(setMissingUserIDs(rows)).toEqual(expected);
  });
});

describe("getRearrangementsByMonth", () => {
  it("throws an error if addDays has invalid data", () => {
    const dateArray = [2020, 12, 27, 0, 0];
    const changes = {
      member: "Jeff",
      addDays: [1, "07:00", 3, 4, 5],
      removeDays: [],
    };

    let error;
    try {
      getRearrangementsByMonth(dateArray, changes);
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error).toMatchSnapshot();
  });

  it("handles empty changes input", () => {
    const dateArray = [2020, 12, 27, 0, 0];
    const changes = {
      member: "Jeff",
      addDays: [],
      removeDays: [],
    };

    const result = getRearrangementsByMonth(dateArray, changes);
    expect(result).toEqual({
      isEmpty: true,
      thisMonth: {
        member: "Jeff",
        slotsToAdd: [],
        daysToRearrange: [],
      },
      nextMonth: {
        member: "Jeff",
        slotsToAdd: [],
        daysToRearrange: [],
      },
    });
  });

  it("Returns rearrangements for both months", () => {
    const dateArray = [2020, 12, 27, 0, 0];
    const changes = {
      member: "Jeff",
      addDays: [29, 3, 4, "17:00"],
      removeDays: [30, 31, 1, 2],
    };

    const result = getRearrangementsByMonth(dateArray, changes);
    expect(result).toEqual({
      isEmpty: false,
      thisMonth: {
        member: "Jeff",
        slotsToAdd: [{ dia: "29-Mar", hora: "17:00" }],
        daysToRearrange: ["29-Mar", "30-Mié", "31-Jue"],
      },
      nextMonth: {
        member: "Jeff",
        slotsToAdd: [
          { dia: "03-Dom", hora: "17:00" },
          { dia: "04-Lun", hora: "17:00" },
        ],
        daysToRearrange: ["01-Vie", "02-Sáb", "03-Dom", "04-Lun"],
      },
    });
  });

  it("Returns rearrangements for only next month", () => {
    const dateArray = [2020, 12, 27, 0, 0];
    const changes = {
      member: "Jeff",
      addDays: [3, 4, "17:00"],
      removeDays: [1, 2],
    };

    const result = getRearrangementsByMonth(dateArray, changes);
    expect(result).toEqual({
      isEmpty: false,
      thisMonth: {
        member: "Jeff",
        slotsToAdd: [],
        daysToRearrange: [],
      },
      nextMonth: {
        member: "Jeff",
        slotsToAdd: [
          { dia: "03-Dom", hora: "17:00" },
          { dia: "04-Lun", hora: "17:00" },
        ],
        daysToRearrange: ["01-Vie", "02-Sáb", "03-Dom", "04-Lun"],
      },
    });
  });

  it("Returns rearrangements for only this month", () => {
    const dateArray = [2020, 12, 27, 0, 0];
    const changes = {
      member: "Jeff",
      addDays: [29, "17:00"],
      removeDays: [30, 31],
    };

    const result = getRearrangementsByMonth(dateArray, changes);
    expect(result).toEqual({
      isEmpty: false,
      thisMonth: {
        member: "Jeff",
        slotsToAdd: [{ dia: "29-Mar", hora: "17:00" }],
        daysToRearrange: ["29-Mar", "30-Mié", "31-Jue"],
      },
      nextMonth: {
        member: "Jeff",
        slotsToAdd: [],
        daysToRearrange: [],
      },
    });
  });
});
