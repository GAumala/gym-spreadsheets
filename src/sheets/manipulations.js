const translateObject = translateKey => src => 
  Object.keys(src).reduce((dst, key) => {
    dst[translateKey(key)] = src[key];
    return dst;
  }, {});

const reconciliateData = ctx => async newData => {
  const { sheet, rows, translateKey, originalData} = ctx;
  let editedCells = 0;

  for (let i = 0; i < rows.length; i++) {
    const currentRow = rows[i];

    if (i >= newData.length) {
      // delete excess tail rows
      await currentRow.delete();
      continue;
    }

    const oldDataItem = originalData[i];
    const newDataItem = newData[i];
    

    let editedRow = false;

    Object.keys(oldDataItem).forEach(key => {
      const oldValue = oldDataItem[key];
      const newValue = newDataItem[key];
      if (oldValue !== newValue) {
        currentRow[translateKey(key)] = newValue;
        editedRow = true;
        editedCells += 1;
      }
    })

    if (editedRow)
      await currentRow.save();
  }

  // append new rows
  if (newData.length > originalData.length) {
    const newRows = newData
      .slice(originalData.length)
      .map(translateObject(translateKey));
    await sheet.addRows(newRows, { raw: true });
  }

  return {editedCells};
};

const resetData = ({ sheet, translateKey }) => async newData => {
  const headerValues = [...sheet.headerValues];
  await sheet.clear();

  if (newData.length === 0)
    return 

  const newRows = newData.map(translateObject(translateKey));
  await sheet.setHeaderRow(headerValues)
  await sheet.addRows(newRows, { raw: true });
}

module.exports = {
  reconciliateData,
  resetData
}
