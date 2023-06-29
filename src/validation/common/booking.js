const Joi = require("joi")

module.exports = {
    bookInDate: Joi.date().iso(),
    bookOutDate: Joi.when("bookInDate", {
        not: undefined,
        then: Joi.date().iso().greater(Joi.ref("bookInDate")),
    }),
}
