const createError = require("http-errors")

const { ACCESS, REFRESH, RESET_PASSWORD, VERIFY_EMAIL } =
    require("../constants").tokenTypes
const userService = require("./user.service")
const tokenService = require("./token.service")
const { Token, User } = require("../models")

const localLogin = async (email, password) => {
    const user = await userService.getUserByEmail(email)
    if (!user) {
        throw createError.BadRequest("Email has not registered")
    }
    if (!user.isEmailVerified) {
        throw createError.Forbidden("User email has not verified")
    }
    if (!(await user.isPasswordMatch(password))) {
        throw createError.BadRequest("Wrong password")
    }
    const authTokens = await tokenService.createAuthTokens(user._id)
    return { user, authTokens }
}

const logout = async (rTokenBody) => {
    const rToken = await Token.findOne({ body: rTokenBody, type: REFRESH })
    if (!rToken) {
        throw createError.NotFound("Token not found")
    }
    rToken.isRevoked = true
    await rToken.save()
}

/**
 * Refresh Auth tokens
 * @param {string} aToken
 * @param {string} rToken
 * @returns {Promise<object>}
 */
const refreshAuthTokens = async (aToken, rToken) => {
    // Remove Bearer
    aToken = aToken.slice(7)

    const aTokenInfo = tokenService.getTokenInfo(aToken)
    const rTokenInfo = tokenService.getTokenInfo(rToken)

    if (
        !aTokenInfo ||
        !rTokenInfo ||
        aTokenInfo.type !== ACCESS ||
        rTokenInfo.type !== REFRESH ||
        rTokenInfo.sub !== aTokenInfo.sub
    ) {
        throw createError.BadRequest("Invalid token")
    }

    if (!aTokenInfo.isExpired) {
        throw createError.BadRequest("Access token has not expired yet")
    }
    if (rTokenInfo.isExpired) {
        throw createError.BadRequest("Refresh token has expired")
    }

    const rTokenInst = await Token.findOne({ body: rToken, type: REFRESH })
    if (!rTokenInst) {
        throw createError.BadRequest("Token not found")
    }
    if (rTokenInst.isBlacklisted) {
        throw createError.Unauthorized("Unauthorized")
    }

    const userId = rTokenInfo.sub
    if (rTokenInst.isUsed || rTokenInst.isRevoked) {
        // Blacklist this token and all usable refresh tokens of that user
        rTokenInst.isBlacklisted = true
        await rTokenInst.save()
        await tokenService.blackListAUser(userId)
        throw createError.Unauthorized("Unauthorized")
    }

    rTokenInst.isUsed = true
    await rTokenInst.save()
    return tokenService.createAuthTokens(userId)
}

const verifyEmail = async (verifyEmailToken) => {
    try {
        tokenService.verifyToken(verifyEmailToken, VERIFY_EMAIL)
        const tokenDoc = await Token.findOne({
            body: verifyEmailToken,
            type: VERIFY_EMAIL,
        })
        if (!tokenDoc) {
            throw createError.NotFound("Token not found")
        }
        const user = await User.findById(tokenDoc.user)
        if (!user) {
            throw createError.NotFound("User not found")
        }
        await Promise.all([
            User.updateOne({ _id: user._id }, { $set: { isEmailVerified: true } }),
            Token.deleteMany({ user: user._id, type: VERIFY_EMAIL }),
        ])
    } catch (error) {
        throw createError.Unauthorized("Email verification failed")
    }
}

module.exports = {
    localLogin,
    logout,
    refreshAuthTokens,
    verifyEmail,
}
