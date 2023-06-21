const Joi = require("joi")
const { user } = require("./common")
const { BODY, QUERY, PARAMS, FILE } = require("../constants").request

module.exports = {
    registerUser: {
        [BODY]: Joi.object({
            name: user.name.required(),
            email: user.email.required(),
            password: user.password.required(),
            phoneNumber: user.phoneNumber,
            dateOfBirth: user.dateOfBirth,
            gender: user.gender,
            address: user.address,
        }),
    },
}
