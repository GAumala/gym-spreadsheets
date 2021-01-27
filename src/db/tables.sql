CREATE TABLE miembro(
  rowid     INTEGER PRIMARY KEY,
  id      TEXT  NOT NULL,
  nombre  TEXT  NOT NULL,
  email   TEXT  NOT NULL,
  entrada TEXT  NOT NULL,
  notas   TEXT  NOT NULL
);
CREATE UNIQUE INDEX memberid_index ON miembro(id);

CREATE TABLE reservacion(
  miembro INT  NOT NULL,
  dia     TEXT NOT NULL,
  hora    TEXT NOT NULL,
  FOREIGN KEY(miembro) REFERENCES miembro(id)
);
CREATE UNIQUE INDEX reserva_index ON reservacion(dia, hora, miembro);
