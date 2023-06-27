const Joi = require("joi")
const { user } = require("./common")
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
}
