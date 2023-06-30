const Joi = require("joi")
const { user, objectId } = require("./common")
const { BODY, QUERY, PARAMS, FILE } = require("../constants").request

module.exports = {
    createAUser: {
        [BODY]: Joi.object({
            name: user.name.required(),
            password: user.password.required(),
            email: user.email.required(),
            roles: user.roles.required(),
            phoneNumber: user.phoneNumber,
            dateOfBirth: user.dateOfBirth,
            gender: user.gender,
            address: user.address,
        }),
    },

    getUserById: {
        [PARAMS]: Joi.object({
            userId: objectId.required(),
        }),
    },

    updateUser: {
        [PARAMS]: Joi.object({
            userId: objectId.required(),
        }),
        [BODY]: Joi.object({
            name: user.name,
            email: user.email,
            roles: user.roles,
            phoneNumber: user.phoneNumber,
            dateOfBirth: user.dateOfBirth,
            gender: user.gender,
            address: user.address,
        }),
    },
}
