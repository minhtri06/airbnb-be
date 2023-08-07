const createError = require("http-errors")
const { StatusCodes } = require("http-status-codes")

const { chatService } = require("../services")

/** @type {controller} */
const makeConversation = async (req, res) => {
    const users = [req.body.withUser, req.user._id]
    await chatService.createConversation({ users })
    return res.status(StatusCodes.CREATED).send()
}

/** @type {controller} */
const getConversationMessages = async (req, res) => {
    const results = await chatService.paginateMessages(
        { conversation: req.params.conversationId },
        req.query,
    )
    return res.json({ ...results })
}

/** @type {controller} */
const postMessage = async (req, res) => {
    req.body.sender = req.user._id
    req.body.conversation = req._conversation._id
    await chatService.createMessage(req.body)
    return res.status(StatusCodes.CREATED).send()
}

module.exports = { makeConversation, getConversationMessages, postMessage }

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
 *
 * @callback controller
 * @param {req} req
 * @param {res} res
 */
