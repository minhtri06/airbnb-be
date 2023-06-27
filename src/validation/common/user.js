const Joi = require("joi")

const { genders } = require("../../constants")
const { ADMIN, NORMAL_USER } = require("../../configs/roles")
const { objectId } = require("./custom")

module.exports = {
    id: Joi.string().custom(objectId),
    name: Joi.string(),
    email: Joi.string().email(),
    roles: Joi.array().items(Joi.string().valid(ADMIN, NORMAL_USER)),
    authType: Joi.string(),
    password: Joi.string().min(6).max(30),
    phoneNumber: Joi.string(),
    dateOfBirth: Joi.date().iso().max("now"),
    gender: Joi.string().valid(...Object.values(genders)),
    address: Joi.object({
        address: Joi.string().required(),
        district: Joi.string().custom(objectId).required(),
        province: Joi.string().custom(objectId).required(),
    }),
}
