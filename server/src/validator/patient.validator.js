const Joi = require('joi');

const patientValidator = Joi.object({

    patientName: Joi.string().required(),

    age: Joi.number().required(),

    gender: Joi.string()
        .valid('male', 'female', 'other')
        .required(),

    disease: Joi.string().allow('', null),

    medicalHistory: Joi.string().allow('', null),

    relation: Joi.string()
        .valid(
            'self',
            'mother',
            'father',
            'child',
            'grandmother',
            'grandfather',
            'other'
        )
        .required()

});

module.exports = patientValidator;