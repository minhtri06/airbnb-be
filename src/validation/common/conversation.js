const Joi = require("joi")
const objectId = require("./objectId")

module.exports = {
    users: Joi.array().items(objectId),
    latestMessage: {
        body: Joi.string(),
        sender: objectId,
    },
}
