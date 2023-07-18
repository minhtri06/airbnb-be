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

module.exports = {
    findUserById,
    cacheUser,
    removeUser,
    findOrCacheFindUserById,
}

/**
 * @typedef {InstanceType<User>} user
 */
