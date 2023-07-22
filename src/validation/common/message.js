const Joi = require("joi")

module.exports = {
    body: Joi.string(),
    isUnSend: Joi.boolean(),
}
