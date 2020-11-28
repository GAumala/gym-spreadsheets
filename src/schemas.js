const { trainingHours } = require('./lib/constants.js');
const Joi = require('joi');

const memberIDRegex = new RegExp('^[a-z_0-9]+$');
const dayRegex = new RegExp('^[0-3][0-9]-(Lun|Mar|Mié|Jue|Vie|Sáb|Dom)$');

const memberIdentificationSchema = Joi.object({
  id: Joi.string()
        .pattern(memberIDRegex)
        .allow(''),
  nombre: Joi.string().required()
});


const memberIdentificationArraySchema = 
  Joi.array().items(memberIdentificationSchema);

const memberSchema = Joi.object({
  id: Joi.string()
        .pattern(memberIDRegex)
        .allow(''),
  nombre: Joi.string().required(),
  email: Joi.string().email().allow(''),
  lesiones: Joi.string().allow(''),
  entrada: Joi.any()
              .valid(...trainingHours)
              .required()
});

const memberArraySchema = Joi.array().items(memberSchema);

const newMemberSchema = Joi.object({
  nombre: Joi.string().required(),
  entrada: Joi.any()
              .valid(...trainingHours)
              .required()
});

const challengeSchema = Joi.object({
  id: Joi.string()
        .pattern(memberIDRegex).required(),
  peso: Joi.number().positive().precision(1),
  fat: Joi.number().positive().precision(1),
  muscle: Joi.number().positive().precision(1)
});

const challengeArraySchema = Joi.array().items(challengeSchema);

const timeSlotSchema = Joi.object({
  miembro: Joi.string()
            .pattern(memberIDRegex).required(),
  dia: Joi.string()
        .pattern(dayRegex).required(),
  hora: Joi.any()
          .valid(...trainingHours)
          .required()
});

const timeSlotArraySchema = Joi.array().items(timeSlotSchema);

module.exports = { 
  challengeArraySchema,
  memberArraySchema, 
  memberIdentificationArraySchema,
  newMemberSchema,
  timeSlotArraySchema
};
