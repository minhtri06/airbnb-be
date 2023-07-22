const Joi = require("joi")

const { conversation, message, objectId, query } = require("./common")
const { BODY, QUERY, PARAMS, FILE } = require("../constants").request

module.exports = {
    makeConversation: {
        [BODY]: Joi.object({
            withUser: objectId.required(),
        }),
    },

    getConversationMessages: {
        [PARAMS]: Joi.object({
            conversationId: objectId.required(),
        }),
        [QUERY]: Joi.object({
            limit: query.limit,
            page: query.page,
        }),
    },

    postMessage: {
        [PARAMS]: Joi.object({
            conversationId: objectId.required(),
        }),
        [BODY]: Joi.object({
            body: message.body.required(),
        }),
    },
}
