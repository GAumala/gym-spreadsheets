const createSheetBoundaryErrorMsg = (docInfo, details) => {
  const { title, translateKey } = docInfo;
  const msgStart = `Por favor revisa los datos ingresados en el documento '${docInfo.docTitle}'.`;
  return details.reduce((msg, detailItem) => {
    const { path, type, context } = detailItem
    const columnName = translateKey(path[1]);
    const rowNumber = path[0] + 2;

    if (type === 'string.empty')
      return msg + 
        `\nLa columna '${columnName}' de la fila #${rowNumber} no debe estar vacía.`;

    if (type === 'any.only')
      return msg + 
        `\nLa columna '${columnName}' solo permite valores [${context.valids}], pero la fila #${rowNumber} contiene '${context.value}'.`;

    if (type === 'number.base')
      return msg + 
        `\nLa columna '${columnName}' solo permite números, pero la fila #${rowNumber} contiene '${context.value}'.`;

    return msg + 
      `\n'${context.value}' en la fila #${rowNumber} no es un valor permitido en la columna '${columnName}' (tipo: ${type}).`
  }, msgStart);
};
  

class SheetAPIError extends Error {
  constructor(apiError) {
    super(apiError.message)
    this.name = 'SheetAPIError'
    this.message = joiError.message
    this.actualError = actualError.details;
  }
  
  toJSON() {
    return {
      error: {
        name: this.name,
        message: this.message,
        stacktrace: this.actualError.stack
      }
    }
  }
};

class SheetBoundaryError extends Error {
  constructor(docInfo, joiError) {
    const message = 
      createSheetBoundaryErrorMsg(docInfo, joiError.details); 
    super(message)
    this.name = 'SheetBoundaryError'
    this.message = message;
    this.details = joiError.details;
  }
  
  toJSON() {
    return {
      error: {
        name: this.name,
        message: this.message,
        details: this.details,
        stacktrace: this.stack
      }
    }
  }
}

const getFatalErrorMsg = (key, params) => {
  switch (key) {
    case 'SHEET_ALREADY_EXISTS':
      return `La hoja ${params.title} ya existe. Si quieres recrearla por favor borrala.`;
    case 'EXCESS_HOURS': 
      return params.excessHours.map(({ entrada, count }) => 
        `Hay demasiados miembros (${count}) reservados para las ${entrada}. Por favor remueve alguno.`)
        .join('\n')
    default: 
      `Error fatal desconocido (${key}) al procesar tu solicitud. params: ${params}`;
  }
}

class FatalError extends Error {
  constructor(key, params) {
    const msg = getFatalErrorMsg(key, params);
    super(msg)
    this.name = 'FatalError'
    this.message = msg;
  }
  
  toJSON() {
    return {
      error: {
        name: this.name,
        message: this.message,
        stacktrace: this.stack
      }
    }
  }
}

module.exports = {
  FatalError,
  SheetAPIError,
  SheetBoundaryError
}
