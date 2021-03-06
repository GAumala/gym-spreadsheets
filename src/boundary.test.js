const { SheetBoundaryError, UserInputBoundaryError } = require("./errors.js");
const {
  getChallengeDataFromSheet,
  getMemberDataFromSheet,
  getTimetableDataFromSheet,
  getReservationChangesFromUserInput,
} = require("./boundary.js");

const sheetMetadata = {
  docTitle: "Test document",
  sheetTitle: "",
  rowCount: 10,
};

describe("getMemberDataFromSheet", () => {
  it("accepts valid data and returns a sanitized value", () => {
    const rows = [
      {
        ID: null,
        NOMBRE: "Carlos Hernández",
        EMAIL: "",
        NOTAS: undefined,
        HORARIO: "07:00",
      },
      {
        ID: "",
        NOMBRE: "Luis Suarez",
        EMAIL: undefined,
        NOTAS: null,
        HORARIO: "07:00",
      },
      {
        ID: "nestor_ponce",
        NOMBRE: "Nestor Ponce",
        EMAIL: "nponce@mail.com",
        NOTAS: "",
        HORARIO: "12:00",
      },
    ];

    const expectedList = [
      {
        id: "",
        nombre: "Carlos Hernández",
        email: "",
        notas: "",
        entrada: "07:00",
      },
      { id: "", nombre: "Luis Suarez", email: "", notas: "", entrada: "07:00" },
      {
        id: "nestor_ponce",
        nombre: "Nestor Ponce",
        email: "nponce@mail.com",
        notas: "",
        entrada: "12:00",
      },
    ];
    const sheetData = getMemberDataFromSheet(sheetMetadata, rows);
    expect(sheetData.data).toEqual(expectedList);
  });

  it("adds a translateKey function when data is correct", () => {
    const rows = [
      {
        NOMBRE: "Nestor Ponce",
        EMAIL: "nponce@mail.com",
        NOTAS: "",
        HORARIO: "12:00",
      },
    ];

    const { translateKey } = getMemberDataFromSheet(sheetMetadata, rows);
    expect(translateKey("nombre")).toEqual("NOMBRE");
  });

  it("throws SheetBoundaryError if data is invalid", () => {
    const rows = [
      {
        ID: null,
        NOMBRE: "Carlos Hernández",
        EMAIL: "",
        NOTAS: undefined,
        HORARIO: "07:00",
      },
      {
        ID: "",
        NOMBRE: "Luis Suarez",
        EMAIL: undefined,
        NOTAS: null,
        HORARIO: "07:00",
      },
      { NOMBRE: "", EMAIL: "nponce@mail.com", NOTAS: "", HORARIO: "12:00" },
    ];

    expect(() => getMemberDataFromSheet(sheetMetadata, rows)).toThrow(
      SheetBoundaryError
    );
  });
});

describe("getChallengeDataFromSheet", () => {
  it("accepts valid data and returns a sanitized value", () => {
    const rows = [
      {
        ID: "iliana_naranjo",
        PESO: 61.5,
        ["%FAT"]: 21.6,
        ["%MUSCL"]: 15.1,
      },
      {
        ID: "cesar_velez",
        PESO: "82.9",
        ["%FAT"]: "41.3",
        ["%MUSCL"]: "33.1",
      },
    ];

    const expectedList = [
      {
        id: "iliana_naranjo",
        peso: 61.5,
        fat: 21.6,
        muscle: 15.1,
      },
      {
        id: "cesar_velez",
        peso: 82.9,
        fat: 41.3,
        muscle: 33.1,
      },
    ];
    const sheetData = getChallengeDataFromSheet(sheetMetadata, rows);
    expect(sheetData.data).toEqual(expectedList);
  });

  it("throws SheetBoundaryError if data is invalid", () => {
    const rows = [
      {
        ID: "iliana_naranjo",
        PESO: 61.5,
        ["%FAT"]: 21.6,
        ["%MUSCL"]: 15.1,
      },
      {
        ID: "cesar_velez",
        PESO: "82.9",
        ["%FAT"]: "41.3",
        ["%MUSCL"]: "",
      },
    ];

    expect(() => getChallengeDataFromSheet(sheetMetadata, rows)).toThrow(
      SheetBoundaryError
    );
  });
});

describe("getTimetableDataFromSheet", () => {
  it("accepts valid data and returns a sanitized value", () => {
    const rows = [
      {
        ["DÍA"]: "09-Lun",
        HORA: "08:00",
        MIEMBRO: "iliana_naranjo",
      },
      {
        ["DÍA"]: "10-Mar",
        HORA: "18:00",
        MIEMBRO: "cesar_velez",
      },
    ];

    const expectedList = [
      {
        miembro: "iliana_naranjo",
        dia: "09-Lun",
        hora: "08:00",
      },
      {
        miembro: "cesar_velez",
        dia: "10-Mar",
        hora: "18:00",
      },
    ];

    const sheetData = getTimetableDataFromSheet(sheetMetadata, rows);
    expect(sheetData.data).toEqual(expectedList);
  });

  it("throws SheetBoundaryError if data is invalid", () => {
    const rows = [
      {
        ["DÍA"]: "9",
        HORA: "08:00",
        MIEMBRO: "iliana_naranjo",
      },
      {
        ["DÍA"]: "10-Mar",
        HORA: "18:00",
        MIEMBRO: "cesar_velez",
      },
    ];

    expect(() => getChallengeDataFromSheet(sheetMetadata, rows)).toThrow(
      SheetBoundaryError
    );
  });

  it("sanitizes hour values", () => {
    const rows = [
      {
        ["DÍA"]: "09-Lun",
        HORA: "8:00",
        MIEMBRO: "iliana_naranjo",
      },
      {
        ["DÍA"]: "10-Mar",
        HORA: "18:00",
        MIEMBRO: "cesar_velez",
      },
    ];

    const expectedList = [
      {
        miembro: "iliana_naranjo",
        dia: "09-Lun",
        hora: "08:00",
      },
      {
        miembro: "cesar_velez",
        dia: "10-Mar",
        hora: "18:00",
      },
    ];

    const sheetData = getTimetableDataFromSheet(sheetMetadata, rows);
    expect(sheetData.data).toEqual(expectedList);
  });
});

describe("getReservationChangesFromUserInput", () => {
  it("accepts valid data and returns a sanitized value", () => {
    const userInput = {
      member: "jeff",
      ["add-days"]: ["1", "3", "8:00", 5, "17:00"],
      ["remove-days"]: [2, 6],
    };
    const sanitizedInput = getReservationChangesFromUserInput(userInput);
    expect(sanitizedInput.data).toEqual({
      member: "jeff",
      addDays: [1, 3, "08:00", 5, "17:00"],
      removeDays: [2, 6],
    });
  });

  it("accepts repeated hours if the are used with different days", () => {
    const userInput = {
      member: "jeff",
      ["add-days"]: ["1", "3", "07:00", 5, "17:00", 8, 10, "07:00"],
      ["remove-days"]: [2, 6],
    };
    const sanitizedInput = getReservationChangesFromUserInput(userInput);
    expect(sanitizedInput.data).toEqual({
      member: "jeff",
      addDays: [1, 3, "07:00", 5, "17:00", 8, 10, "07:00"],
      removeDays: [2, 6],
    });
  });

  it("throws UserInputBoundaryError if remove-days contains training hours", () => {
    const userInput = {
      member: "jeff",
      ["add-days"]: ["1", "3", "8:00", 5, "17:00"],
      ["remove-days"]: [2, 6, "07:00"],
    };
    expect(() => getReservationChangesFromUserInput(userInput)).toThrow(
      UserInputBoundaryError
    );
  });

  it("throws UserInputBoundaryError if add-days contains duplicated days", () => {
    const userInput = {
      member: "jeff",
      ["add-days"]: ["1", "3", "8:00", 1, "17:00"],
      ["remove-days"]: [2, 6],
    };
    expect(() => getReservationChangesFromUserInput(userInput)).toThrow(
      UserInputBoundaryError
    );
  });

  it("throws UserInputBoundaryError if remove-days contains duplicated days", () => {
    const userInput = {
      member: "jeff",
      ["add-days"]: ["1", "3", "8:00", 5, "17:00"],
      ["remove-days"]: [2, 6, 8, 2],
    };
    expect(() => getReservationChangesFromUserInput(userInput)).toThrow(
      UserInputBoundaryError
    );
  });
});
