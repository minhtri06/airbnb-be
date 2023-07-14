const Joi = require("joi")

module.exports = {
    bookIn: Joi.date().iso(),
    bookOut: Joi.date().iso(),
}
