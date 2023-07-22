const createError = require("http-errors")
const Joi = require("joi")

const { BODY, QUERY, PARAMS } = require("../../constants").request

const emptyObj = Joi.object({})

const validate = (schema) => async (req, res, next) => {
    for (let prop of [BODY, QUERY, PARAMS]) {
        const validator = schema[prop] || emptyObj
        const { value, error } = validator.validate(req[prop], {
            errors: { wrap: { label: "'" } },
        })
        if (error) {
            next(new createError.BadRequest(`Request error (${prop}): ${error.message}`))
        } else {
            req[prop] = value
        }
    }

    return next()
}

module.exports = validate
