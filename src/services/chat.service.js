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
const findManyConversations = async (filter, { populate, sort } = {}) => {
    const query = Conversation.find(filter)
    if (populate) query.populate(populate)
    if (sort) query.sort(sort)
    return query
}

const populateConversations = async (conversations, options) => {
    return Conversation.populate(conversations, options)
}

const upsertConversation = async ({ fromUserId, toUserId, body }) => {
    const users = [fromUserId, toUserId]
    let convo = await Conversation.findOneAndUpdate(
        { users: { $all: users } },
        { latestMessage: { body, sender: fromUserId } },
        { new: true },
    )
    if (!convo) {
        convo = new Conversation({ users, latestMessage: { body, sender: fromUserId } })
        await convo.save()
    }
    return convo
}

const addMessage = async ({ fromUserId, toUserId, body }) => {
    if (fromUserId.toString() === toUserId.toString()) {
        throw createError.BadRequest("You cannot send message to yourself")
    }
    const msg = new Message({ users: [fromUserId, toUserId], body })
    return Promise.all([msg.save(), upsertConversation({ fromUserId, toUserId, body })])
}

/**
 * Paginate messages
 * @param {messageFilter} filter
 * @param {*} queryOptions
 * @returns
 */
const paginateMessages = async (filter, queryOptions = { limit: 20 }) => {
    return Message.paginate(filter, queryOptions)
}

/**
 * Find many messages
 * @param {messageFilter} filter
 * @param {{ sort: string }} param1
 * @returns
 */
const findManyMessages = async (filter, { sort, lean } = {}) => {
    const query = Message.find(filter)
    if (sort) query.sort(sort)
    if (lean) query.lean()
    return query
}

module.exports = {
    findOneConversation,
    findConversationById,
    getOneConversation,
    getConversationById,
    findManyConversations,
    populateConversations,
    addMessage,
    paginateMessages,
    findManyMessages,
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
