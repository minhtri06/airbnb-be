const Joi = require("joi")
const { genders } = require("../../constants")
const { objectId } = require("./custom")

module.exports = {
    id: Joi.string().custom(objectId),
    name: Joi.string(),
    email: Joi.string().email(),
    authType: Joi.string(),
    password: Joi.string().min(6).max(30),
    phoneNumber: Joi.string(),
    dateOfBirth: Joi.date().max("now"),
    gender: Joi.string().valid(...Object.values(genders)),
    address: Joi.object({
        address: Joi.string().required(),
        district: Joi.string().custom(objectId).required(),
        province: Joi.string().custom(objectId).required(),
    }),
}
