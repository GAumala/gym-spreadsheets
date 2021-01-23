const { trainingHours } = require("./lib/constants.js");
const Joi = require("joi");

const memberIDRegex = new RegExp("^[a-z_0-9]+$");
const dayRegex = new RegExp("^[0-3][0-9]-(Lun|Mar|Mié|Jue|Vie|Sáb|Dom)$");

const onlyNumbersComparator = (a, b) => {
  if (typeof a === "number" && typeof b === "number") return a === b;

  return false;
};

const memberIdentificationSchema = Joi.object({
  id: Joi.string().pattern(memberIDRegex).allow(""),
  nombre: Joi.string().required(),
});

const memberIdentificationArraySchema = Joi.array().items(
  memberIdentificationSchema
);

const memberSchema = Joi.object({
  id: Joi.string().pattern(memberIDRegex).allow(""),
  nombre: Joi.string().required(),
  email: Joi.string().email().allow(""),
  notas: Joi.string().allow(""),
  entrada: Joi.any()
    .valid(...trainingHours)
    .required(),
});

const memberIDStringSchema = Joi.object({
  id: Joi.string().pattern(memberIDRegex).required(),
});

const memberArraySchema = Joi.array().items(memberSchema);

const newMemberSchema = Joi.object({
  id: Joi.string().pattern(memberIDRegex).allow(""),
  name: Joi.string().required(),
  hour: Joi.any()
    .valid(...trainingHours)
    .required(),
});

const newReservationSchema = Joi.object({
  member: Joi.string().pattern(memberIDRegex).required(),
  day: Joi.number().positive().integer().max(31).required(),
  hour: Joi.any()
    .valid(...trainingHours)
    .required(),
});

const timeSchema = Joi.object({
  day: Joi.number().positive().integer().max(31),
  hour: Joi.any().valid(...trainingHours),
});

const challengeSchema = Joi.object({
  id: Joi.string().pattern(memberIDRegex).required(),
  peso: Joi.number().positive().precision(1),
  fat: Joi.number().positive().precision(1),
  muscle: Joi.number().positive().precision(1),
});

const challengeArraySchema = Joi.array().items(challengeSchema);

const timeSlotSchema = Joi.object({
  miembro: Joi.string().pattern(memberIDRegex).required(),
  dia: Joi.string().pattern(dayRegex).required(),
  hora: Joi.any()
    .valid(...trainingHours)
    .required(),
});

const timeSlotArraySchema = Joi.array().items(timeSlotSchema);

const reservationChangesSchema = Joi.object({
  member: Joi.string().pattern(memberIDRegex),
  removeDays: Joi.array()
    .items(Joi.number().positive().integer().min(1).max(31))
    .unique()
    .required(),
  // for add-days we only want uniqueness in numbers (days), not strings (hours)
  // so we pass a custom comparator
  addDays: Joi.array()
    .items(
      Joi.alternatives().try(Joi.any().valid(...trainingHours), Joi.number())
    )
    .unique(onlyNumbersComparator)
    .required(),
});

const cacheMetadataSchema = Joi.object({
  args: Joi.array().items(Joi.string()),
  systemTime: Joi.number().positive().integer(),
  type: Joi.string(),
});

const hashSchema = Joi.object({
  hash: Joi.string().min(1).max(10).alphanum().case("lower").required(),
});

const sheetTitleSchema = Joi.object({
  sheetTitle: Joi.string().required(),
});

module.exports = {
  cacheMetadataSchema,
  challengeArraySchema,
  hashSchema,
  memberArraySchema,
  memberIDStringSchema,
  memberIdentificationArraySchema,
  newMemberSchema,
  newReservationSchema,
  sheetTitleSchema,
  timeSlotArraySchema,
  reservationChangesSchema,
  timeSchema,
};
