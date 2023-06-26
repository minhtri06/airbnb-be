const Joi = require("joi")

const { BODY, QUERY, PARAMS, FILE } = require("../constants").request

module.exports = {
    getAllDistricts: {
        [QUERY]: Joi.object({
            provinceCode: Joi.number().integer(),
        }),
    },
}
