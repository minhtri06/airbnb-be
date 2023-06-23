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
        accessToken: accessToken.slice(7), // Remove Bearer
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

const getPayload = (token) => {
    return jwt.decode(token, SECRET)
}

const getTokenInfo = (token) => {
    const info = getPayload(token)
    if (info) {
        info.isExpired = info.exp < moment().unix()
    }
    return info
}

const getRefreshTokenByTokenBody = async (tokenBody) => {
    const refreshToken = await RefreshToken.findOne({ body: tokenBody })
    return refreshToken
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
    getRefreshTokenByTokenBody,
    blackListAUser,
}
