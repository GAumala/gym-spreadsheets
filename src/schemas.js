const Joi = require('joi');

const memberIDRegex = new RegExp('^[a-z_0-9]+$');
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
              .valid('06:00', 
                     '07:00', 
                     '08:00', 
                     '09:30', 
                     '11:00', 
                     '12:00', 
                     '17:00', 
                     '18:00', 
                     '19:00')
              .required()
});

const memberArraySchema = Joi.array().items(memberSchema);

const challengeSchema = Joi.object({
  id: Joi.string()
        .pattern(memberIDRegex).required(),
  peso: Joi.number().positive().precision(1),
  fat: Joi.number().positive().precision(1),
  muscle: Joi.number().positive().precision(1)
});

const challengeArraySchema = Joi.array().items(challengeSchema);

module.exports = { 
  challengeArraySchema,
  memberArraySchema, 
  memberIdentificationArraySchema 
};
