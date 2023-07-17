const { User } = require("../models")
const { redisClient } = require("../db")
const { DEFAULT_EXPIRATION } = require("../configs/envConfig").redis

/**
 * Get user from redis, return null if not found
 * @param {string} userId
 * @returns {Promise<user | null>}
 */
const getUser = async (userId) => {
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
 * Get user from redis, if not found get from database,
 * return null if not found in database
 * @param {string} userId
 * @returns {Promise<user | null>}
 */
const getOrCacheGetUser = async (userId) => {
    let user = await getUser(userId)

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
    getUser,
    cacheUser,
    removeUser,
    getOrCacheGetUser,
}

/**
 * @typedef {InstanceType<User>} user
 */
