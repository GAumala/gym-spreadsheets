CREATE TABLE miembro(
  rowid     INTEGER PRIMARY KEY,
  id        TEXT  NOT NULL,
  nombre    TEXT  NOT NULL,
  email     TEXT  NOT NULL,
  entrada   TEXT  NOT NULL,
  lesiones  TEXT  NOT NULL
);
CREATE UNIQUE INDEX memberid_index ON miembro(id);

CREATE TABLE medicionDiff(
  miembro       INT   NOT NULL,
  pesoFinal     REAL  NOT NULL,
  fatFinal      REAL  NOT NULL,
  muscleFinal   REAL  NOT NULL,
  pesoInicial   REAL  NOT NULL,
  fatInicial    REAL  NOT NULL,
  muscleInicial REAL  NOT NULL,
  FOREIGN KEY(miembro) REFERENCES miembro(rowid)
);

CREATE TABLE reserva(
  miembro INT  NOT NULL,
  mes     TEXT NOT NULL,
  dia     TEXT NOT NULL,
  hora    TEXT NOT NULL,
  FOREIGN KEY(miembro) REFERENCES miembro(rowid)
);
