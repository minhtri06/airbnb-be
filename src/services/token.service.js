const jwt = require("jsonwebtoken")
const moment = require("moment")

const { ACCESS, REFRESH } = require("../constants").tokenTypes
const {
    jwt: { SECRET, ACCESS_EXPIRATION_MINUTES, REFRESH_EXPIRATION_DAYS },
} = require("../configs/envConfig")
const { RefreshToken } = require("../models")

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

const createRefreshToken = async (userId, accessToken) => {
    const expires = moment().add(REFRESH_EXPIRATION_DAYS, "days")
    const token = generateToken(userId, expires, REFRESH)
    return await RefreshToken.create({
        body: token,
        user: userId,
        accessToken,
        expires: expires.toDate(),
    })
}

const createAuthTokens = async (userId) => {
    const accessToken = generateAccessToken(userId)
    const refreshToken = await createRefreshToken(userId, accessToken)
    return {
        accessToken,
        refreshToken: refreshToken.token,
    }
}

const getPayload = (token) => {
    return jwt.decode(token, SECRET_KEY)
}

const getTokenInfo = (token) => {
    const info = getPayload(token)
    if (info) {
        info.isExpired = info.exp < moment().unix()
    }
    return info
}

const blackListAUser = async (userId) => {
    await RefreshToken.updateMany(
        { user: userId, isUsed: false, isRevoked: false },
        { isBlacklisted: true },
    )
}

module.exports = {
    generateToken,
    generateAccessToken,
    createAuthTokens,
    getPayload,
    getTokenInfo,
    blackListAUser,
}
