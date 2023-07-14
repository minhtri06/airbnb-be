const createError = require("http-errors")

const requireFields = (obj, ...fields) => {
    for (let field of fields) {
        if (!obj[field]) {
            throw createError.BadRequest(`${field} is required`)
        }
    }
}

module.exports = requireFields
