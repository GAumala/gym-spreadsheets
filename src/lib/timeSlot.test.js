const {
  breakTimeSlotsWithDate,
  convertDateToSlot,
  createMonthSlots,
} = require("./timeSlot.js");

describe("createMonthSlots", () => {
  it("should generate slots for November 2020", () => {
    const expected = [
      { hora: "06:00", dia: "02-Lun" },
      { hora: "07:00", dia: "02-Lun" },
      { hora: "08:00", dia: "02-Lun" },
      { hora: "09:30", dia: "02-Lun" },
      { hora: "11:00", dia: "02-Lun" },
      { hora: "12:00", dia: "02-Lun" },
      { hora: "17:00", dia: "02-Lun" },
      { hora: "18:00", dia: "02-Lun" },
      { hora: "19:00", dia: "02-Lun" },
      { hora: "06:00", dia: "03-Mar" },
      { hora: "07:00", dia: "03-Mar" },
      { hora: "08:00", dia: "03-Mar" },
      { hora: "09:30", dia: "03-Mar" },
      { hora: "11:00", dia: "03-Mar" },
      { hora: "12:00", dia: "03-Mar" },
      { hora: "17:00", dia: "03-Mar" },
      { hora: "18:00", dia: "03-Mar" },
      { hora: "19:00", dia: "03-Mar" },
      { hora: "06:00", dia: "04-Mié" },
      { hora: "07:00", dia: "04-Mié" },
      { hora: "08:00", dia: "04-Mié" },
      { hora: "09:30", dia: "04-Mié" },
      { hora: "11:00", dia: "04-Mié" },
      { hora: "12:00", dia: "04-Mié" },
      { hora: "17:00", dia: "04-Mié" },
      { hora: "18:00", dia: "04-Mié" },
      { hora: "19:00", dia: "04-Mié" },
      { hora: "06:00", dia: "05-Jue" },
      { hora: "07:00", dia: "05-Jue" },
      { hora: "08:00", dia: "05-Jue" },
      { hora: "09:30", dia: "05-Jue" },
      { hora: "11:00", dia: "05-Jue" },
      { hora: "12:00", dia: "05-Jue" },
      { hora: "17:00", dia: "05-Jue" },
      { hora: "18:00", dia: "05-Jue" },
      { hora: "19:00", dia: "05-Jue" },
      { hora: "06:00", dia: "06-Vie" },
      { hora: "07:00", dia: "06-Vie" },
      { hora: "08:00", dia: "06-Vie" },
      { hora: "09:30", dia: "06-Vie" },
      { hora: "11:00", dia: "06-Vie" },
      { hora: "12:00", dia: "06-Vie" },
      { hora: "17:00", dia: "06-Vie" },
      { hora: "18:00", dia: "06-Vie" },
      { hora: "19:00", dia: "06-Vie" },
      { hora: "06:00", dia: "07-Sáb" },
      { hora: "07:00", dia: "07-Sáb" },
      { hora: "08:00", dia: "07-Sáb" },
      { hora: "09:30", dia: "07-Sáb" },
      { hora: "11:00", dia: "07-Sáb" },
      { hora: "12:00", dia: "07-Sáb" },
      { hora: "17:00", dia: "07-Sáb" },
      { hora: "18:00", dia: "07-Sáb" },
      { hora: "19:00", dia: "07-Sáb" },
      { hora: "06:00", dia: "09-Lun" },
      { hora: "07:00", dia: "09-Lun" },
      { hora: "08:00", dia: "09-Lun" },
      { hora: "09:30", dia: "09-Lun" },
      { hora: "11:00", dia: "09-Lun" },
      { hora: "12:00", dia: "09-Lun" },
      { hora: "17:00", dia: "09-Lun" },
      { hora: "18:00", dia: "09-Lun" },
      { hora: "19:00", dia: "09-Lun" },
      { hora: "06:00", dia: "10-Mar" },
      { hora: "07:00", dia: "10-Mar" },
      { hora: "08:00", dia: "10-Mar" },
      { hora: "09:30", dia: "10-Mar" },
      { hora: "11:00", dia: "10-Mar" },
      { hora: "12:00", dia: "10-Mar" },
      { hora: "17:00", dia: "10-Mar" },
      { hora: "18:00", dia: "10-Mar" },
      { hora: "19:00", dia: "10-Mar" },
      { hora: "06:00", dia: "11-Mié" },
      { hora: "07:00", dia: "11-Mié" },
      { hora: "08:00", dia: "11-Mié" },
      { hora: "09:30", dia: "11-Mié" },
      { hora: "11:00", dia: "11-Mié" },
      { hora: "12:00", dia: "11-Mié" },
      { hora: "17:00", dia: "11-Mié" },
      { hora: "18:00", dia: "11-Mié" },
      { hora: "19:00", dia: "11-Mié" },
      { hora: "06:00", dia: "12-Jue" },
      { hora: "07:00", dia: "12-Jue" },
      { hora: "08:00", dia: "12-Jue" },
      { hora: "09:30", dia: "12-Jue" },
      { hora: "11:00", dia: "12-Jue" },
      { hora: "12:00", dia: "12-Jue" },
      { hora: "17:00", dia: "12-Jue" },
      { hora: "18:00", dia: "12-Jue" },
      { hora: "19:00", dia: "12-Jue" },
      { hora: "06:00", dia: "13-Vie" },
      { hora: "07:00", dia: "13-Vie" },
      { hora: "08:00", dia: "13-Vie" },
      { hora: "09:30", dia: "13-Vie" },
      { hora: "11:00", dia: "13-Vie" },
      { hora: "12:00", dia: "13-Vie" },
      { hora: "17:00", dia: "13-Vie" },
      { hora: "18:00", dia: "13-Vie" },
      { hora: "19:00", dia: "13-Vie" },
      { hora: "06:00", dia: "14-Sáb" },
      { hora: "07:00", dia: "14-Sáb" },
      { hora: "08:00", dia: "14-Sáb" },
      { hora: "09:30", dia: "14-Sáb" },
      { hora: "11:00", dia: "14-Sáb" },
      { hora: "12:00", dia: "14-Sáb" },
      { hora: "17:00", dia: "14-Sáb" },
      { hora: "18:00", dia: "14-Sáb" },
      { hora: "19:00", dia: "14-Sáb" },
      { hora: "06:00", dia: "16-Lun" },
      { hora: "07:00", dia: "16-Lun" },
      { hora: "08:00", dia: "16-Lun" },
      { hora: "09:30", dia: "16-Lun" },
      { hora: "11:00", dia: "16-Lun" },
      { hora: "12:00", dia: "16-Lun" },
      { hora: "17:00", dia: "16-Lun" },
      { hora: "18:00", dia: "16-Lun" },
      { hora: "19:00", dia: "16-Lun" },
      { hora: "06:00", dia: "17-Mar" },
      { hora: "07:00", dia: "17-Mar" },
      { hora: "08:00", dia: "17-Mar" },
      { hora: "09:30", dia: "17-Mar" },
      { hora: "11:00", dia: "17-Mar" },
      { hora: "12:00", dia: "17-Mar" },
      { hora: "17:00", dia: "17-Mar" },
      { hora: "18:00", dia: "17-Mar" },
      { hora: "19:00", dia: "17-Mar" },
      { hora: "06:00", dia: "18-Mié" },
      { hora: "07:00", dia: "18-Mié" },
      { hora: "08:00", dia: "18-Mié" },
      { hora: "09:30", dia: "18-Mié" },
      { hora: "11:00", dia: "18-Mié" },
      { hora: "12:00", dia: "18-Mié" },
      { hora: "17:00", dia: "18-Mié" },
      { hora: "18:00", dia: "18-Mié" },
      { hora: "19:00", dia: "18-Mié" },
      { hora: "06:00", dia: "19-Jue" },
      { hora: "07:00", dia: "19-Jue" },
      { hora: "08:00", dia: "19-Jue" },
      { hora: "09:30", dia: "19-Jue" },
      { hora: "11:00", dia: "19-Jue" },
      { hora: "12:00", dia: "19-Jue" },
      { hora: "17:00", dia: "19-Jue" },
      { hora: "18:00", dia: "19-Jue" },
      { hora: "19:00", dia: "19-Jue" },
      { hora: "06:00", dia: "20-Vie" },
      { hora: "07:00", dia: "20-Vie" },
      { hora: "08:00", dia: "20-Vie" },
      { hora: "09:30", dia: "20-Vie" },
      { hora: "11:00", dia: "20-Vie" },
      { hora: "12:00", dia: "20-Vie" },
      { hora: "17:00", dia: "20-Vie" },
      { hora: "18:00", dia: "20-Vie" },
      { hora: "19:00", dia: "20-Vie" },
      { hora: "06:00", dia: "21-Sáb" },
      { hora: "07:00", dia: "21-Sáb" },
      { hora: "08:00", dia: "21-Sáb" },
      { hora: "09:30", dia: "21-Sáb" },
      { hora: "11:00", dia: "21-Sáb" },
      { hora: "12:00", dia: "21-Sáb" },
      { hora: "17:00", dia: "21-Sáb" },
      { hora: "18:00", dia: "21-Sáb" },
      { hora: "19:00", dia: "21-Sáb" },
      { hora: "06:00", dia: "23-Lun" },
      { hora: "07:00", dia: "23-Lun" },
      { hora: "08:00", dia: "23-Lun" },
      { hora: "09:30", dia: "23-Lun" },
      { hora: "11:00", dia: "23-Lun" },
      { hora: "12:00", dia: "23-Lun" },
      { hora: "17:00", dia: "23-Lun" },
      { hora: "18:00", dia: "23-Lun" },
      { hora: "19:00", dia: "23-Lun" },
      { hora: "06:00", dia: "24-Mar" },
      { hora: "07:00", dia: "24-Mar" },
      { hora: "08:00", dia: "24-Mar" },
      { hora: "09:30", dia: "24-Mar" },
      { hora: "11:00", dia: "24-Mar" },
      { hora: "12:00", dia: "24-Mar" },
      { hora: "17:00", dia: "24-Mar" },
      { hora: "18:00", dia: "24-Mar" },
      { hora: "19:00", dia: "24-Mar" },
      { hora: "06:00", dia: "25-Mié" },
      { hora: "07:00", dia: "25-Mié" },
      { hora: "08:00", dia: "25-Mié" },
      { hora: "09:30", dia: "25-Mié" },
      { hora: "11:00", dia: "25-Mié" },
      { hora: "12:00", dia: "25-Mié" },
      { hora: "17:00", dia: "25-Mié" },
      { hora: "18:00", dia: "25-Mié" },
      { hora: "19:00", dia: "25-Mié" },
      { hora: "06:00", dia: "26-Jue" },
      { hora: "07:00", dia: "26-Jue" },
      { hora: "08:00", dia: "26-Jue" },
      { hora: "09:30", dia: "26-Jue" },
      { hora: "11:00", dia: "26-Jue" },
      { hora: "12:00", dia: "26-Jue" },
      { hora: "17:00", dia: "26-Jue" },
      { hora: "18:00", dia: "26-Jue" },
      { hora: "19:00", dia: "26-Jue" },
      { hora: "06:00", dia: "27-Vie" },
      { hora: "07:00", dia: "27-Vie" },
      { hora: "08:00", dia: "27-Vie" },
      { hora: "09:30", dia: "27-Vie" },
      { hora: "11:00", dia: "27-Vie" },
      { hora: "12:00", dia: "27-Vie" },
      { hora: "17:00", dia: "27-Vie" },
      { hora: "18:00", dia: "27-Vie" },
      { hora: "19:00", dia: "27-Vie" },
      { hora: "06:00", dia: "28-Sáb" },
      { hora: "07:00", dia: "28-Sáb" },
      { hora: "08:00", dia: "28-Sáb" },
      { hora: "09:30", dia: "28-Sáb" },
      { hora: "11:00", dia: "28-Sáb" },
      { hora: "12:00", dia: "28-Sáb" },
      { hora: "17:00", dia: "28-Sáb" },
      { hora: "18:00", dia: "28-Sáb" },
      { hora: "19:00", dia: "28-Sáb" },
      { hora: "06:00", dia: "30-Lun" },
      { hora: "07:00", dia: "30-Lun" },
      { hora: "08:00", dia: "30-Lun" },
      { hora: "09:30", dia: "30-Lun" },
      { hora: "11:00", dia: "30-Lun" },
      { hora: "12:00", dia: "30-Lun" },
      { hora: "17:00", dia: "30-Lun" },
      { hora: "18:00", dia: "30-Lun" },
      { hora: "19:00", dia: "30-Lun" },
    ];

    expect(createMonthSlots(2020, 11)).toEqual(expected);
  });
});

describe("convertDateToSlot", () => {
  it("converts a regular date", () => {
    const slot = convertDateToSlot(2020, 11, 26, 9, 5);
    expect(slot).toEqual({ dia: "26-Jue", hora: "09:05" });
  });
});

describe("breakTimeSlotsWithDate", () => {
  it("returns an object with past and future arrays", () => {
    const slots = [
      { dia: "25-Mié", hora: "09:30" },
      { dia: "26-Jue", hora: "07:00" },
      { dia: "26-Jue", hora: "08:00" },
      { dia: "26-Jue", hora: "09:30" },
      { dia: "27-Vie", hora: "07:00" },
      { dia: "27-Vie", hora: "08:00" },
      { dia: "27-Vie", hora: "09:30" },
    ];

    const dateArray = [2020, 11, 26, 9, 29];
    const { past, future } = breakTimeSlotsWithDate(slots, dateArray);
    expect(past).toEqual([
      { dia: "25-Mié", hora: "09:30" },
      { dia: "26-Jue", hora: "07:00" },
      { dia: "26-Jue", hora: "08:00" },
    ]);
    expect(future).toEqual([
      { dia: "26-Jue", hora: "09:30" },
      { dia: "27-Vie", hora: "07:00" },
      { dia: "27-Vie", hora: "08:00" },
      { dia: "27-Vie", hora: "09:30" },
    ]);
  });

  it("if current time matches any slot, that slot goes in future", () => {
    const slots = [
      { dia: "25-Mié", hora: "09:30" },
      { dia: "26-Jue", hora: "07:00" },
      { dia: "26-Jue", hora: "08:00" },
      { dia: "26-Jue", hora: "09:30" },
      { dia: "27-Vie", hora: "07:00" },
      { dia: "27-Vie", hora: "08:00" },
      { dia: "27-Vie", hora: "09:30" },
    ];

    const dateArray = [2020, 11, 26, 9, 30];
    const { past, future } = breakTimeSlotsWithDate(slots, dateArray);
    expect(past).toEqual([
      { dia: "25-Mié", hora: "09:30" },
      { dia: "26-Jue", hora: "07:00" },
      { dia: "26-Jue", hora: "08:00" },
    ]);
    expect(future).toEqual([
      { dia: "26-Jue", hora: "09:30" },
      { dia: "27-Vie", hora: "07:00" },
      { dia: "27-Vie", hora: "08:00" },
      { dia: "27-Vie", hora: "09:30" },
    ]);
  });

  it("if current time matches first slot, the first goes on future", () => {
    const slots = [
      { dia: "26-Jue", hora: "07:00" },
      { dia: "26-Jue", hora: "08:00" },
      { dia: "26-Jue", hora: "09:30" },
      { dia: "27-Vie", hora: "07:00" },
      { dia: "27-Vie", hora: "08:00" },
      { dia: "27-Vie", hora: "09:30" },
    ];

    const dateArray = [2020, 11, 26, 7, 0];
    const { past, future } = breakTimeSlotsWithDate(slots, dateArray);
    expect(past).toEqual([]);
    expect(future).toEqual([
      { dia: "26-Jue", hora: "07:00" },
      { dia: "26-Jue", hora: "08:00" },
      { dia: "26-Jue", hora: "09:30" },
      { dia: "27-Vie", hora: "07:00" },
      { dia: "27-Vie", hora: "08:00" },
      { dia: "27-Vie", hora: "09:30" },
    ]);
  });

  it("if current time matches last slot, the last goes on future", () => {
    const slots = [
      { dia: "26-Jue", hora: "07:00" },
      { dia: "26-Jue", hora: "08:00" },
      { dia: "26-Jue", hora: "09:30" },
      { dia: "27-Vie", hora: "07:00" },
      { dia: "27-Vie", hora: "08:00" },
      { dia: "27-Vie", hora: "09:30" },
    ];

    const dateArray = [2020, 11, 27, 9, 30];
    const { past, future } = breakTimeSlotsWithDate(slots, dateArray);
    expect(past).toEqual([
      { dia: "26-Jue", hora: "07:00" },
      { dia: "26-Jue", hora: "08:00" },
      { dia: "26-Jue", hora: "09:30" },
      { dia: "27-Vie", hora: "07:00" },
      { dia: "27-Vie", hora: "08:00" },
    ]);
    expect(future).toEqual([{ dia: "27-Vie", hora: "09:30" }]);
  });

  it("handles a date in the past", () => {
    const slots = [
      { dia: "26-Jue", hora: "07:00" },
      { dia: "26-Jue", hora: "08:00" },
      { dia: "26-Jue", hora: "09:30" },
      { dia: "27-Vie", hora: "07:00" },
      { dia: "27-Vie", hora: "08:00" },
      { dia: "27-Vie", hora: "09:30" },
    ];

    const dateArray = [2020, 11, 21, 9, 29];
    const { past, future } = breakTimeSlotsWithDate(slots, dateArray);
    expect(past).toEqual([]);
    expect(future).toEqual(slots);
  });

  it("handles a date in the future", () => {
    const slots = [
      { dia: "26-Jue", hora: "07:00" },
      { dia: "26-Jue", hora: "08:00" },
      { dia: "26-Jue", hora: "09:30" },
      { dia: "27-Vie", hora: "07:00" },
      { dia: "27-Vie", hora: "08:00" },
      { dia: "27-Vie", hora: "09:30" },
    ];

    const dateArray = [2020, 11, 30, 9, 29];
    const { past, future } = breakTimeSlotsWithDate(slots, dateArray);
    expect(past).toEqual(slots);
    expect(future).toEqual([]);
  });
});
