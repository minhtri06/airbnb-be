const createError = require("http-errors")
const { StatusCodes } = require("http-status-codes")

const { chatService } = require("../services")
const { pickFields } = require("../utils")

/** @type {controller} */
const addMessage = async (req, res) => {
    await chatService.addMessage({
        fromUserId: req.user._id,
        toUserId: req.body.toUserId,
        body: req.body.body,
    })
    return res.status(StatusCodes.CREATED).send()
}

/** @type {controller} */
const getMessages = async (req, res) => {
    const { withUserId } = req.query
    if (req.user._id.equals(withUserId)) {
        throw createError.BadRequest("You don't have chat message with yourself")
    }
    const messages = await chatService.findManyMessages(
        { users: { $all: [req.user._id, withUserId] } },
        { sort: "-createdAt", lean: true },
    )
    for (let m of messages) {
        m.userIds = m.users
        m.users = undefined
    }
    return res.json({ messages })
}

module.exports = { addMessage, getMessages }

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
