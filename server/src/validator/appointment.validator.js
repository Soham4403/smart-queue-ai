const Joi = require('joi');

const appointmentValidator = Joi.object({

    patientId: Joi.string().required(),

    doctorId: Joi.string().required(),

    appointmentDate: Joi.string().required(),

    appointmentTime: Joi.string().required()

});

module.exports = appointmentValidator;