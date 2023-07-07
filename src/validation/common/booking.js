const Joi = require("joi")

module.exports = {
    bookIn: Joi.date().iso(),
    bookOut: Joi.when("bookIn", {
        not: undefined,
        then: Joi.date().iso().greater(Joi.ref("bookIn")),
    }),
}
