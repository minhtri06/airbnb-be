const Joi = require("joi")

const { BODY, QUERY, PARAMS, FILE } = require("../constants").request
const { province, objectId } = require("./common")

module.exports = {
    getDistricts: {
        [QUERY]: Joi.object({
            provinceCode: province.code,
            provinceId: objectId,
        }),
    },
}
