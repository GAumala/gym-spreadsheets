const reconciliateCellEdits = (rows, translateKey, oldData) => (newData) => {
  for (let i = 0; i < rows.length; i++) {
    const currentRow = rows[i];

    const oldDataItem = oldData[i];
    const newDataItem = newData[i];
    let editedRow = false;

    Object.keys(oldDataItem).forEach(key => {
      const oldValue = oldDataItem[key];
      const newValue = newDataItem[key];
      if (oldValue !== newValue) {
        currentRow[translateKey(key)] = newValue;
        editedRow = true;
      }
    })

    if (editedRow)
      currentRow.save();
  }
}



module.exports = {
  reconciliateCellEdits
}
