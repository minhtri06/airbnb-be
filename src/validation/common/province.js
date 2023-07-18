const Joi = require("joi")

module.exports = {
    name: Joi.string(),
    code: Joi.number().integer(),
    divisionType: Joi.string(),
}
