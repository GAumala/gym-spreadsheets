const createSheetBoundaryErrorMsg = (docInfo, details) => {
  const { translateKey } = docInfo;
  const msgStart = `Por favor revisa los datos ingresados en el documento '${docInfo.docTitle}'.`;
  return details.reduce((msg, detailItem) => {
    const { path, type, context } = detailItem;
    const columnName = translateKey(path[1]);
    const rowNumber = path[0] + 2;

    if (type === "string.empty")
      return (
        msg +
        `\nLa columna '${columnName}' de la fila #${rowNumber} no debe estar vacía.`
      );

    if (type === "any.only")
      return (
        msg +
        `\nLa columna '${columnName}' solo permite valores [${context.valids}], pero la fila #${rowNumber} contiene '${context.value}'.`
      );

    if (type === "number.base")
      return (
        msg +
        `\nLa columna '${columnName}' solo permite números, pero la fila #${rowNumber} contiene '${context.value}'.`
      );

    return (
      msg +
      `\n'${context.value}' en la fila #${rowNumber} no es un valor permitido en la columna '${columnName}' (tipo: ${type}).`
    );
  }, msgStart);
};

const createUserInputBoundaryErrorMsg = (details) => {
  const msgStart = `Por favor revisa los datos ingresados.`;
  return details.reduce((msg, detailItem) => {
    const { path, type, context } = detailItem;
    const fieldName = path[0];

    if (type === "string.empty")
      return msg + `\nEl campo '${fieldName}' no debe estar vacío.`;

    if (type === "any.only")
      return (
        msg +
        `\nEl campo '${fieldName}' solo permite valores [${context.valids}], pero se ingresó '${context.value}'.`
      );

    if (type === "number.base")
      return (
        msg +
        `\nEl campo '${fieldName}' solo permite números, se ingresó '${context.value}'.`
      );

    if (type === "array.unique")
      return (
        msg +
        `\nEl campo '${fieldName}' no puede incluir dos veces el mismo valor '${context.value}'.`
      );
    return (
      msg +
      `\n'${context.value}' no es un valor permitido en el campo '${fieldName}' (tipo: ${type}).`
    );
  }, msgStart);
};

const getFatalErrorMsg = (key, params) => {
  switch (key) {
    case "SHEET_ALREADY_EXISTS":
      return `La hoja ${params.title} ya existe. Si quieres recrearla por favor borrala.`;
    case "SHEET_NOT_FOUND":
      return `La hoja ${params.title} no existe.`;
    case "MEMBER_ID_TAKEN":
      return `Error al agregar nuevo miembro con id "${params.id}". Ya hay un miembro (${params.nombre}) con ese id. Si crees que esto no es un error por favor especifica manualmente un id que no sea "${params.id}".`;
    case "NEW_MEMBER_ENTRADA_CONSTR":
      return `Error al agregar nuevo miembro con horario de ${params.entrada}. Ya hay ${params.count} miembros en ese horario.`;
    case "EXCESS_MEMBERS_IN_HOUR":
      return params.violations
        .map(
          ({ entrada, count }) =>
            `Hay demasiados miembros (${count}) reservados para las ${entrada}. Por favor remueve alguno.`
        )
        .join("\n");
    case "EXCESS_RESERVATIONS_IN_SLOT":
      return params.violations
        .map(
          ({ dia, hora, count }) =>
            `Hay demasiadas reservas (${count}) para la fecha ${dia} ${hora}. Por favor remueve alguna reserva temporal.`
        )
        .join("\n");
    case "ADDED_EXCESS_RESERVATIONS":
      return (
        "No se pudieron agregar las reservaciones solicitadas por que los siguientes horarios ya están llenos:\n\n" +
        params.violations.map(({ dia, hora }) => `${dia} ${hora}`).join("\n") +
        "\n\nLa operación se cancelo antes de modificar algun spreadsheet. Por favor vuelve a intentar con diferentes horarios."
      );
    case "SLOT_IS_FULL":
      return `No se pueden agregar mas miembros para el día ${params.dia} a las ${params.hora}. Por favor busca otro horario.`;
    case "UNKNOWN_RESERVATION_MEMBER":
      return `Se encontro una reservacion para ${params.miembro} con fecha ${params.dia} ${params.hora}, pero este miembro no existe. Por favor arregla la hoja de reservaciones.`;
    case "ALREADY_RESERVED":
      return `Este miembro ya reservó anteriormente para el día ${params.dia} a las ${params.hora}.`;
    case "MEMBER_NOT_FOUND":
      return `No se encontró un miembro con ID: ${params.id}.`;
    case "HASH_NOT_FOUND":
      return `No se encontraron datos con el hash ${params.hash}.`;
    case "HISTORY_FILE_CORRUPTED":
      return `No se pudo deshacer la operación porque el archivo de tipo ${params.type} se ha corrompido.`;
    case "NO_RESERVATIONS_INPUT":
      return `Por favor ingresa las fechas de las reservaciones a modificar.`;
    case "INVALID_TIME_SLOTS_INPUT_ARRAY": {
      const line1 = `Error de sintaxis en los horarios ingresados: "${params.value.join(
        " "
      )}"`;
      const line2 = 'Debes alternar días con horas. Ejemplo: "1 07:00 2 17:00"';
      const line3 =
        'También puedes agrupar varios días con la misma hora, pero procura siempre terminar con una hora. Ejemplo: "1 2 3 07:00 4 5 17:00"';
      return line1 + "\n" + line2 + "\n" + line3;
    }
    default:
      `Error fatal desconocido (${key}) al procesar tu solicitud. params: ${params}`;
  }
};

class SheetAPIError extends Error {
  constructor(apiError) {
    super(apiError.message);
    this.name = "SheetAPIError";
    this.message = apiError.message;
    this.actualError = apiError;
    this.isCustom = true;
  }

  toJSON() {
    return {
      error: {
        name: this.name,
        message: this.message,
        stacktrace: this.actualError.stack,
      },
    };
  }
}

class SheetBoundaryError extends Error {
  constructor(docInfo, joiError) {
    const message = createSheetBoundaryErrorMsg(docInfo, joiError.details);
    super(message);
    this.name = "SheetBoundaryError";
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
        stacktrace: this.stack,
      },
    };
  }
}

class UserInputBoundaryError extends Error {
  constructor(joiError) {
    const message = createUserInputBoundaryErrorMsg(joiError.details);
    super(message);
    this.name = "UserInputBoundaryError";
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
        stacktrace: this.stack,
      },
    };
  }
}

class FatalError extends Error {
  constructor(key, params) {
    const msg = getFatalErrorMsg(key, params);
    super(msg);
    this.name = "FatalError";
    this.message = msg;
    this.isCustom = true;
  }

  toJSON() {
    return {
      error: {
        name: this.name,
        message: this.message,
        stacktrace: this.stack,
      },
    };
  }
}

module.exports = {
  FatalError,
  SheetAPIError,
  SheetBoundaryError,
  UserInputBoundaryError,
};
