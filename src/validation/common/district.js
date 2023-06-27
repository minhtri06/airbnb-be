const Joi = require("joi")
const province = require("./province")
const { objectId } = require("./custom")

module.exports = {
    id: Joi.string().custom(objectId),
    name: Joi.string(),
    divisionType: Joi.string(),
    code: Joi.number().integer(),
    provinceCode: province.code,
    province: province.id,
}
