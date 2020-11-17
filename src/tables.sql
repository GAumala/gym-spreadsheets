CREATE TABLE miembro(
  rowid     INTEGER PRIMARY KEY,
  id        TEXT  NOT NULL,
  nombre    TEXT  NOT NULL,
  email     TEXT  NOT NULL,
  entrada   TEXT  NOT NULL,
  lesiones  TEXT  NOT NULL
);
CREATE UNIQUE INDEX memberid_index ON miembro(id);

CREATE TABLE challengeStart(
  miembro   INT  NOT NULL,
  medicion  INT  NOT NULL,
  FOREIGN KEY(miembro) REFERENCES miembro(id)
);

CREATE TABLE challengeEnd(
  miembro   INT  NOT NULL,
  medicion  INT  NOT NULL,
  FOREIGN KEY(miembro) REFERENCES miembro(id)
);

CREATE TABLE reserva(
  miembro INT  NOT NULL,
  mes     TEXT NOT NULL,
  dia     TEXT NOT NULL,
  hora    TEXT NOT NULL,
  FOREIGN KEY(miembro) REFERENCES miembro(id)
);
