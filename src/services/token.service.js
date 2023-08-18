const createError = require("http-errors")
const jwt = require("jsonwebtoken")
const moment = require("moment")

const { Token } = require("../models")
const { ACCESS, REFRESH, RESET_PASSWORD, VERIFY_EMAIL } =
    require("../constants").tokenTypes
const {
    jwt: {
        SECRET,
        ACCESS_EXPIRATION_MINUTES,
        REFRESH_EXPIRATION_DAYS,
        RESET_PASSWORD_EXPIRATION_MINUTES,
        VERIFY_EMAIL_EXPIRATION_MINUTES,
    },
} = require("../configs/envConfig")

/**
 * Find one token, return null if not found
 * @param {tokenFilter} filter
 * @returns {Promise<token | null>}
 */
const findOneToken = (filter) => {
    return Token.findOne(filter)
}

/**
 * Get one token, throw error if not found
 * @param {tokenFilter} filter
 * @returns {Promise<token>}
 */
const getOneToken = async (filter) => {
    const token = await findOneToken(filter)
    if (!token) {
        throw createError.NotFound("Token not found")
    }
    return token
}

/**
 * Generate a token
 * @param {string} userId
 * @param {moment.Moment} expires
 * @param {string} type
 * @returns {string}
 */
const generateToken = (userId, expires, type) => {
    const payload = {
        sub: userId,
        iat: moment().unix(),
        exp: expires.unix(),
        type,
    }
    return jwt.sign(payload, SECRET)
}

/**
 * Generate a new access token
 * @param {string} userId
 * @returns {string}
 */
const generateAccessToken = (userId) => {
    const expires = moment().add(ACCESS_EXPIRATION_MINUTES, "minutes")
    return `Bearer ${generateToken(userId, expires, ACCESS)}`
}

/**
 * Create a refresh token for a user
 * @param {string} userId
 * @returns {Promise<token>}
 */
const createRefreshToken = async (userId) => {
    const expires = moment().add(REFRESH_EXPIRATION_DAYS, "days")
    const token = generateToken(userId, expires, REFRESH)
    return await Token.create({
        body: token,
        user: userId,
        type: REFRESH,
        expires: expires.toDate(),
        isRevoked: false,
        isUsed: false,
        isBlacklisted: false,
    })
}

/**
 * Create reset password token for a user
 * @param {string} userId
 * @returns {Promise<token>}
 */
const createResetPasswordToken = async (userId) => {
    const expires = moment().add(RESET_PASSWORD_EXPIRATION_MINUTES, "minutes")
    const token = generateToken(userId, expires, RESET_PASSWORD)
    return Token.create({
        body: token,
        user: userId,
        type: RESET_PASSWORD,
        expires: expires.toDate(),
    })
}

/**
 * Create verify verify token for a user
 * @param {string} userId
 * @returns {Promise<token>}
 */
const createVerifyEmailToken = async (userId) => {
    const expires = moment().add(VERIFY_EMAIL_EXPIRATION_MINUTES, "minutes")
    const token = generateToken(userId, expires, VERIFY_EMAIL)
    return Token.create({
        body: token,
        user: userId,
        type: VERIFY_EMAIL,
        expires: expires.toDate(),
    })
}

/**
 * Create auth tokens
 * @param {string} userId
 * @returns {Promise<{ accessToken, refreshToken }>}
 */
const createAuthTokens = async (userId) => {
    const accessToken = generateAccessToken(userId)
    const refreshToken = await createRefreshToken(userId, accessToken)
    return {
        accessToken,
        refreshToken: refreshToken.body,
    }
}

/**
 * Verify a token and return token's payload
 * @param {string} token
 * @param {string} type
 * @param {{ ignoreExpiration?: boolean }} options
 * @returns {{ sub, iat, exp, type }}
 */
const verifyToken = (token, type, options = {}) => {
    try {
        const payload = jwt.verify(token, SECRET, options)
        if (payload.type !== type) {
            throw createError.Unauthorized(`Invalid ${type} token`)
        }
        return payload
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            throw createError.Unauthorized(error.message)
        }
        throw error
    }
}

/**
 * Blacklist all usable tokens of a user
 * @param {string} userId
 */
const blackListAUser = async (userId) => {
    await Token.updateMany(
        { user: userId, type: REFRESH, isUsed: false, isRevoked: false },
        { isBlacklisted: true },
    )
}

/**
 * Delete many tokens
 * @param {tokenFilter} filter
 */
const deleteManyTokens = async (filter) => {
    return Token.deleteMany(filter)
}

module.exports = {
    findOneToken,
    getOneToken,
    generateToken,
    generateAccessToken,
    createRefreshToken,
    createResetPasswordToken,
    createVerifyEmailToken,
    createAuthTokens,
    verifyToken,
    blackListAUser,
    deleteManyTokens,
}

/**
 * @typedef {InstanceType<Token>} token
 *
 * @typedef {Object} tokenFilter
 * @property {string} _id
 * @property {string} body
 * @property {string} user
 * @property {string} type
 * @property {Date} expires
 * @property {boolean} isRevoked
 * @property {boolean} isUsed
 * @property {boolean} isBlacklisted
 */
