const fs = require('fs');
const path = require('path');
const util = require('util');

const mkdir = util.promisify(fs.mkdir);
const readdir = util.promisify(fs.readdir);
const rmdir = util.promisify(fs.rmdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const write = async ({ storageDir, key, fileName, value }) => {
  const contents = JSON.stringify(value, null, 4);
  const dirPath = path.join(storageDir, key);
  const filePath = path.join(dirPath, fileName);

  await mkdir(dirPath, { recursive:true })
  await writeFile(filePath, contents);
}

const read = async ({ storageDir, key, fileName }) => {
  const items = await readdir(storageDir);
  const matchingItems = items.filter(name => name.startsWith(key));
  if (matchingItems.length !== 1)
    return;

  const dirPath = path.join(storageDir, matchingItems[0]);
  const filePath = path.join(dirPath, fileName);

  try {
    const contents = await readFile(filePath, { encoding: 'utf8' });
    return JSON.parse(contents);
  } catch (e) {
    return undefined;
  }
}

const readAll = async ({ storageDir, key }) =>  {
  const items = await readdir(storageDir);
  const matchingItems = items.filter(name => name.startsWith(key));
  if (matchingItems.length !== 1)
    return;

  const dirPath = path.join(storageDir, matchingItems[0]);
  const files = await readdir(dirPath);

  return Promise.all(files.map(
    fileName => read({ storageDir, key, fileName })));
}

const rm = ({ storageDir, key }) => {
  const dirPath = path.join(storageDir, key);
  return rmdir(dirPath, { recursive: true });
}

const listKeys = async ({ storageDir }) => {
  const keys = await readdir(storageDir);
  return keys;
}

module.exports = { listKeys, read, readAll, rm, write }
