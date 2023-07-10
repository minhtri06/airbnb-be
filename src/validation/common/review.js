const Joi = require("joi")

module.exports = {
    body: Joi.string(),
    score: Joi.number().integer().min(0).max(10),
}
