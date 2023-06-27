const Joi = require("joi")

const { BODY, QUERY, PARAMS, FILE } = require("../constants").request
const { province } = require("./common")

module.exports = {
    getAllDistricts: {
        [QUERY]: Joi.object({
            provinceCode: province.code,
            provinceId: province.id,
        }),
    },
}
