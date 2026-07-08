const joi = require('joi');

const doctorSchema = joi.object({
    name: joi.string().required(),
    is_available: joi.boolean(),
    qualification: joi.string(),
    fees: joi.number(),
    specialized: joi.string(),
    experience: joi.number()
});

module.exports = doctorSchema;