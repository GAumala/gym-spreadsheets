const { createUserID, setMissingUserIDs } = require("./lib.js");

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
