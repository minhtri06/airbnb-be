const Joi = require("joi")

const { objectId } = require("./custom")

module.exports = {
    id: Joi.string().custom(objectId),
    code: Joi.number().integer(),
}
