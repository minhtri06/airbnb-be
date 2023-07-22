const createError = require("http-errors")

const { Conversation, Message } = require("../models")
const { pickFields } = require("../utils")

/**
 * Find many conversations
 * @param {conversationFilter} filter
 * @returns {Promise<conversation>}
 */
const findConversations = async (filter) => {
    return Conversation.find(filter)
}

/**
 * Create new conversation
 * @param {{ users }} body
 * @returns {Promise<conversation>}
 */
const createConversation = async (body) => {
    body = pickFields(body, "users")

    const conversation = new Conversation(body)

    return conversation.save()
}

/**
 *
 * @param {messageFilter} filter
 * @param {*} queryOptions
 * @returns
 */
const paginateMessages = async (filter, queryOptions = { limit: 20 }) => {
    return Message.paginate(filter, queryOptions)
}

/**
 * Create new Message
 * @param {{ sender, body, conversation }} body
 * @returns {Promise<message>}
 */
const createMessage = async (body) => {
    body = pickFields(body, "sender", "body", "conversation")
    const msg = new Message(body)
    return msg.save()
}

module.exports = {
    findConversations,
    createConversation,
    paginateMessages,
    createMessage,
}

/**
 * @typedef {InstanceType<Conversation>} conversation
 * @typedef {InstanceType<Message>} message
 *
 * @typedef {import('mongoose').Types.ObjectId | string} id
 *
 * @typedef {Object} conversationFilter
 * @property {string[]} users
 * @property {Object} latestMessage
 * @property {string} latestMessage.body
 * @property {id} latestMessage.sender
 *
 * @typedef {Object} messageFilter
 * @property {id} sender
 * @property {string} body
 * @property {id} conversation
 * @property {boolean} isUnSend
 *
 * @typedef {Object} queryOptions
 * @property {Object} sortBy
 * @property {number} page
 * @property {number} limit
 * @property {string} select
 * @property {string} populate
 * @property {boolean} lean
 */
