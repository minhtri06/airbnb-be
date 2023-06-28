const Joi = require("joi")
const { user } = require("./common")
const { BODY, QUERY, PARAMS } = require("../constants").request

module.exports = {
    updateMyProfile: {
        [BODY]: Joi.object({
            name: user.name,
            phoneNumber: user.phoneNumber,
            dateOfBirth: user.dateOfBirth,
            gender: user.gender,
            address: user.address,
        }),
    },
}
