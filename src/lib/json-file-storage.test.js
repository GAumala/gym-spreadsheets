const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

const tempDirectory = require("temp-dir");
const storageDir = path.join(tempDirectory, "testing-gym-spreadsheets");
const { read, write, rm } = require("./json-file-storage.js");

afterAll(async () => {
  const clean = promisify(fs.rmdir);
  return clean(storageDir, { recursive: true });
});

describe("read", () => {
  it("can retrieve data stored with write", async () => {
    const key = "8ba2dc68fb";
    const fileName = "my-data.json";
    const value = { foo: 1, bar: "z", xyz: ["a", "b", "c"] };
    await write({ storageDir, key, fileName, value });

    const readValue = await read({ storageDir, key, fileName });
    expect(readValue).toEqual(value);
  });

  it("only needs a prefix of the key to get the correct value", async () => {
    const fileName = "my-data.json";

    const key1 = "44387c89e5";
    const value1 = { foo: 1 };
    await write({ storageDir, key: key1, fileName, value: value1 });

    const key2 = "cf16136fd6";
    const value2 = { bar: 2 };
    await write({ storageDir, key: key2, fileName, value: value2 });

    const readValue = await read({ storageDir, key: "44387", fileName });
    expect(readValue).toEqual(value1);
  });

  it("returns undefined if the key prefix used is ambiguous", async () => {
    const fileName = "my-data.json";

    const key1 = "d62f2bd001";
    const value1 = { foo: 1 };
    await write({ storageDir, key: key1, fileName, value: value1 });

    const key2 = "d62f2be778";
    const value2 = { bar: 2 };
    await write({ storageDir, key: key2, fileName, value: value2 });

    const readValue = await read({ storageDir, key: "d62f2", fileName });
    expect(readValue).toBeUndefined();
  });

  it("returns undefined if the key gets deleted", async () => {
    const key = "d0a9da9b15";
    const fileName = "my-data.json";
    const value = { foo: 1, bar: "z" };
    await write({ storageDir, key, fileName, value });

    const readValue1 = await read({ storageDir, key, fileName });
    expect(readValue1).not.toBeUndefined();

    await rm({ storageDir, key });

    const readValue2 = await read({ storageDir, key, fileName });
    expect(readValue2).toBeUndefined();
  });

  it("returns undefined if the key does not exist", async () => {
    const key = "cc12c7d471";
    const fileName = "my-data.json";

    const readValue = await read({ storageDir, key, fileName });
    expect(readValue).toBeUndefined();
  });

  it("returns undefined if the key exists but the file does not", async () => {
    const key = "2c337bf67a";
    const fileName = "my-data.json";
    const value = { foo: 1 };
    await write({ storageDir, key, fileName, value });

    const readValue = await read({
      storageDir,
      key,
      fileName: "wrong-name.json",
    });
    expect(readValue).toBeUndefined();
  });
});
