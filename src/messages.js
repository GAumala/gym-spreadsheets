module.exports = (key, params) => {
  switch (key) {
    case "NO_RESERVATIONS":
      return `No existen reservaciones para la fecha: ${params.date}`;
    case "LIST_RESERVATIONS":
      return `Fecha: ${params.date}\nMiembros:\n\n${params.members.join(
        "\n"
      )}\n\n${params.members.length} en total.`;
    default:
      `Mensaje desconocido (${key}). params: ${params}`;
  }
};
