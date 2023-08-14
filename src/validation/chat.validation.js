const Joi = require("joi")

const { conversation, message, objectId, query } = require("./common")
const { BODY, QUERY, PARAMS, FILE } = require("../constants").request

module.exports = {
    addMessage: {
        [BODY]: Joi.object({
            toUserId: objectId.required(),
            body: message.body.required(),
        }),
    },

    getMessages: {
        [QUERY]: Joi.object({
            withUserId: objectId.required(),
        }),
    },
}
