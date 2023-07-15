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

const generateToken = (userId, expires, type) => {
    const payload = {
        sub: userId,
        iat: moment().unix(),
        exp: expires.unix(),
        type,
    }
    return jwt.sign(payload, SECRET)
}

const generateAccessToken = (userId) => {
    const expires = moment().add(ACCESS_EXPIRATION_MINUTES, "minutes")
    return `Bearer ${generateToken(userId, expires, ACCESS)}`
}

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

const createEmailVerifyToken = async (userId) => {
    const expires = moment().add(VERIFY_EMAIL_EXPIRATION_MINUTES, "minutes")
    const token = generateToken(userId, expires, VERIFY_EMAIL)
    return Token.create({
        body: token,
        user: userId,
        type: VERIFY_EMAIL,
        expires: expires.toDate(),
    })
}

const createAuthTokens = async (userId) => {
    const accessToken = generateAccessToken(userId)
    const refreshToken = await createRefreshToken(userId, accessToken)
    return {
        accessToken,
        refreshToken: refreshToken.body,
    }
}

/**
 * @param {string} token
 * @returns {{sub, iat, exp, type, isExpired}}
 */
const getTokenInfo = (token) => {
    const info = jwt.decode(token, SECRET)
    if (info) {
        info.isExpired = info.exp < moment().unix()
    }
    return info
}

/**
 * @param {string} token
 * @param {string} type
 * @returns {{ sub, iat, exp, type, isExpired }}
 */
const verifyToken = (token, type) => {
    const info = getTokenInfo(token)
    if (!info || info.type !== type) {
        throw createError.BadRequest(`Invalid ${type} token`)
    }
    if (info.isExpired) {
        throw createError.BadRequest(`${type} token has expired`)
    }
    return info
}

const blackListAUser = async (userId) => {
    await Token.updateMany(
        { user: userId, type: REFRESH, isUsed: false, isRevoked: false },
        { isBlacklisted: true },
    )
}

module.exports = {
    generateToken,
    generateAccessToken,
    createRefreshToken,
    createResetPasswordToken,
    createEmailVerifyToken,
    createAuthTokens,
    getTokenInfo,
    verifyToken,
    blackListAUser,
}
