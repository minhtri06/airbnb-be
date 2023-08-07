const Joi = require("joi")
const province = require("./province")
const objectId = require("./objectId")

module.exports = {
    name: Joi.string(),
    divisionType: Joi.string(),
    code: Joi.number().integer(),
    provinceCode: province.code,
    province: objectId,
    latitude: Joi.number(),
    longitude: Joi.number(),
}
