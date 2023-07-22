const createError = require("http-errors")

const { chatService } = require("../services")

/** @type {middleware} */
const getConversationById = async (req, res, next) => {
    req._conversation = await chatService.getConversationById(req.params.conversationId)
    return next()
}

/** @returns {middleware} */
const requireToBeConversationMember = ({ allowAdmin } = {}) => {
    return async (req, res, next) => {
        if (!req.user) {
            throw createError.Forbidden("Forbidden")
        }
        if (allowAdmin && req.user.role === ADMIN) {
            return next()
        }
        if (req._conversation.users.some((memberId) => memberId.equals(req.user._id))) {
            return next()
        }
        throw createError.Forbidden("Require to be property owner")
    }
}

module.exports = { getConversationById, requireToBeConversationMember }

/**
 * @typedef {InstanceType<import("../models/User")>} user
 * @typedef {InstanceType<import("../models/Conversation")>} conversation
 *
 * @typedef {{
 *   user: user,
 *   _conversation: conversation
 * }} attachedData
 *
 * @typedef {import('express').Request & attachedData} req
 * @typedef {import('express').Response} res
 * @typedef {import('express').NextFunction} next
 *
 * @callback middleware
 * @param {req} req
 * @param {res} res
 * @param {next} next
 */
