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
  
const createUserInputBoundaryErrorMsg = (details) => {
  const msgStart = `Por favor revisa los datos ingresados.`;
  return details.reduce((msg, detailItem) => {
    const { path, type, context } = detailItem
    const fieldName = path[0];

    if (type === 'string.empty')
      return msg + 
        `\nEl campo '${fieldName}' no debe estar vacío.`;

    if (type === 'any.only')
      return msg + 
        `\nEl campo '${fieldName}' solo permite valores [${context.valids}], pero se ingresó '${context.value}'.`;

    if (type === 'number.base')
      return msg + 
        `\nEl campo '${fieldName}' solo permite números, se ingresó '${context.value}'.`;

    return msg + 
      `\n'${context.value}' no es un valor permitido en el campo '${fieldName}' (tipo: ${type}).`
  }, msgStart);
};

const getFatalErrorMsg = (key, params) => {
  switch (key) {
    case 'SHEET_ALREADY_EXISTS':
      return `La hoja ${params.title} ya existe. Si quieres recrearla por favor borrala.`;
    case 'SHEET_NOT_FOUND':
      return `La hoja ${params.title} no existe.`;
    case 'NEW_MEMBER_ENTRADA_CONSTR':
      return `Error al agregar nuevo miembro con horario de ${params.entrada}. Ya hay ${params.count} miembros en ese horario.`;
    case 'EXCESS_MEMBERS_IN_HOUR': 
      return params.violations.map(({ entrada, count }) => 
        `Hay demasiados miembros (${count}) reservados para las ${entrada}. Por favor remueve alguno.`)
        .join('\n')
    case 'EXCESS_RESERVATIONS_IN_SLOT': 
      return params.violations.map(({ dia, hora, count }) => 
        `Hay demasiadas reservas (${count}) para la fecha ${dia} ${hora}. Por favor remueve alguna reserva temporal.`)
        .join('\n')
    case 'SLOT_IS_FULL': 
      return `No se pueden agregar mas miembros para el día ${params.dia} a las ${params.hora}. Por favor busca otro horario.`;
    case 'ALREADY_RESERVED': 
      return `Este miembro ya reservó anteriormente para el día ${params.dia} a las ${params.hora}.`;    
    default: 
      `Error fatal desconocido (${key}) al procesar tu solicitud. params: ${params}`;
  }
}

class SheetAPIError extends Error {
  constructor(apiError) {
    super(apiError.message)
    this.name = 'SheetAPIError'
    this.message = joiError.message
    this.actualError = actualError.details;
    this.isCustom = true;
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
    this.isCustom = true;
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

class UserInputBoundaryError extends Error {
  constructor(joiError) {
    const message = 
      createUserInputBoundaryErrorMsg(joiError.details); 
    super(message)
    this.name = 'UserInputBoundaryError'
    this.message = message;
    this.details = joiError.details;
    this.isCustom = true;
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

class FatalError extends Error {
  constructor(key, params) {
    const msg = getFatalErrorMsg(key, params);
    super(msg)
    this.name = 'FatalError'
    this.message = msg;
    this.isCustom = true;
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
  SheetBoundaryError,
  UserInputBoundaryError
}
