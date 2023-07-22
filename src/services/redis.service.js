const { User } = require("../models")
const { redisClient } = require("../db")
const { DEFAULT_EXPIRATION } = require("../configs/envConfig").redis

/**
 * find user from redis, return null if not found
 * @param {string} userId
 * @returns {Promise<user | null>}
 */
const findUserById = async (userId) => {
    const userObj = JSON.parse(await redisClient.get(`user:${userId}`))
    return userObj ? User.hydrate(userObj) : null
}

/**
 * Cache user to redis
 * @param {user} user
 */
const cacheUser = async (user) => {
    await redisClient.setEx(
        `user:${user._id}`,
        DEFAULT_EXPIRATION,
        JSON.stringify(user.toObject()),
    )
}

/**
 * Remove user from redis
 * @param {string} userId
 */
const removeUser = async (userId) => {
    await redisClient.del(`user:${userId}`)
}

/**
 * Find user from redis. If not found, find from database.
 * If not found in database, return null
 * @param {string} userId
 * @returns {Promise<user | null>}
 */
const findOrCacheFindUserById = async (userId) => {
    let user = await findUserById(userId)

    if (!user) {
        const userService = require("./user.service")
        user = await userService.findUserById(userId)
        if (!user) {
            return null
        }
        cacheUser(user)
    }

    return user
}

/**
 * Find user socket of a user by user id, return null if not found
 * @param {id} userId
 * @returns {Promise<string>}
 */
const findUserSocketId = async (userId) => {
    return redisClient.get(`user-socket:${userId}`)
}

/**
 * Cache user socket
 * @param {id} userId
 * @param {string} socketId
 */
const cacheUserSocketId = async (userId, socketId) => {
    await redisClient.set(`user-socket:${userId}`, socketId)
}

/**
 * Delete user socket
 * @param {id} userId
 */
const deleteUserSocketId = async (userId) => {
    await redisClient.del(`user-socket:${userId}`)
}

module.exports = {
    findUserById,
    cacheUser,
    removeUser,
    findOrCacheFindUserById,
    findUserSocketId,
    cacheUserSocketId,
    deleteUserSocketId,
}

/**
 * @typedef {InstanceType<User>} user
 *
 * @typedef {import('mongoose').Types.ObjectId | string} id
 */
