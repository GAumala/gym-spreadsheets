const Joi = require('joi');


const memberSchema = Joi.object({
  id: Joi.string()
        .pattern(new RegExp('^[a-z_0-9]$'))
        .default('')
        .allow(''),
  nombre: Joi.string().required(),
  email: Joi.string().email().default('').allow(''),
  lesiones: Joi.string().default('').allow(''),
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
                .allow('')
                .default(''),
});

const memberRowsSchema = Joi.array().items(memberSchema);

const getMembersFromSheetRows = rows => {
  const validation = memberRowsSchema.validate(
    rows.map(row => ({
      id: row.ID || '',
      nombre: row.NOMBRE,
      email: row.EMAIL || '',
      entrada: row.ENTRADA || '',
      lesiones: row.LESIONES || '',
    })
  ));

  if (validation.error)
    return validation;

  const translateKey = key => {
    switch (key) {
      case 'id': return 'ID';
      case 'nombre': return 'NOMBRE';
      case 'email': return 'EMAIL';
      case 'entrada': return 'ENTRADA';
      case 'lesiones': return 'LESIONES';
    }
  }
  return { ...validation, translateKey }
}

module.exports = { getMembersFromSheetRows }
