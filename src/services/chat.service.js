const createError = require("http-errors")

const { Conversation, Message } = require("../models")
const { pickFields } = require("../utils")

/**
 * Find one conversation, return null if not found
 * @param {conversationFilter} filter
 * @return {Promise<conversation | null>}
 */
const findOneConversation = async (filter) => {
    return Conversation.findOne(filter)
}

/**
 * Find conversation by id, return null if not found
 * @param {id} conversationId
 * @returns {Promise<conversation | null>}
 */
const findConversationById = async (conversationId) => {
    return findOneConversation({ _id: conversationId })
}

/**
 * Get one conversation, throw error if not found
 * @param {conversationFilter} filter
 * @returns {Promise<conversation>}
 */
const getOneConversation = async (filter) => {
    const conversation = await findOneConversation(filter)
    if (!conversation) {
        throw createError.NotFound("Conversation not found")
    }
    return conversation
}

/**
 * Get conversation by id, throw error if not found
 * @param {id} conversationId
 * @returns {Promise<conversation>}
 */
const getConversationById = async (conversationId) => {
    return getOneConversation({ _id: conversationId })
}

/**
 * Find many conversations
 * @param {conversationFilter} filter
 * @returns {Promise<conversation[]>}
 */
const findConversations = async (filter, { populate }) => {
    const query = Conversation.find(filter)
    if (populate) {
        query.populate(populate)
    }
    return query.exec()
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
    findOneConversation,
    findConversationById,
    getOneConversation,
    getConversationById,
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
 * @property {id} _id
 * @property {string[]} users
 * @property {Object} latestMessage
 * @property {string} latestMessage.body
 * @property {id} latestMessage.sender
 *
 * @typedef {Object} messageFilter
 * @property {id} _id
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
