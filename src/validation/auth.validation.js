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

    localLogin: {
        [BODY]: Joi.object({
            email: user.email.required(),
            password: user.password.required(),
        }),
    },

    googleLogin: {
        [QUERY]: Joi.object({
            code: Joi.string().required(),
        }),
    },

    logout: {
        [BODY]: Joi.object({
            refreshToken: Joi.string().required(),
        }),
    },

    refreshToken: {
        [BODY]: Joi.object({
            refreshToken: Joi.string().required(),
            accessToken: Joi.string().required(),
        }),
    },

    verifyEmail: {
        [QUERY]: Joi.object({
            token: Joi.string().required(),
        }),
    },

    forgotPassword: {
        [BODY]: Joi.object({
            email: user.email.required(),
        }),
    },

    resetPassword: {
        [QUERY]: Joi.object({
            token: Joi.string().required(),
        }),
        [BODY]: Joi.object({
            newPassword: user.password.required(),
        }),
    },
}
