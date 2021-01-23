const printRearrangedSlots = (rearrangedSlots) =>
  rearrangedSlots.reduce((str, slot) => {
    if (slot.deleted) return str + `${slot.dia} <ELIMINADA>\n`;
    if (slot.noTimeTable) return str + `${slot.dia} <SIN HOJA>\n`;

    return str + `${slot.dia} ${slot.hora || "?????"}\n`;
  }, "");

module.exports = (key, params) => {
  switch (key) {
    case "NO_RESERVATIONS":
      return `No existen reservaciones para la fecha: ${params.date}`;
    case "LIST_RESERVATIONS":
      return `Fecha: ${params.date}\nMiembros:\n\n${params.members.join(
        "\n"
      )}\n\n${params.members.length} en total.`;
    case "LIST_REARRANGEMENTS": {
      const list = printRearrangedSlots(params.rearrangedSlots);
      return `Se modificaron las reservaciones de ${params.name}:\n\n${list}`;
    }
    default:
      return `Mensaje desconocido (${key}). params: ${params}`;
  }
};
