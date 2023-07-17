const createError = require("http-errors")

const {
    tokenTypes: { ACCESS, REFRESH, RESET_PASSWORD, VERIFY_EMAIL },
    authTypes: { LOCAL, GOOGLE },
} = require("../constants")
const userService = require("./user.service")
const tokenService = require("./token.service")

/**
 * Local login
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user, token }>}
 */
const localLogin = async (email, password) => {
    const user = await userService.getOneUser({ email })

    if (user.authType !== LOCAL) {
        throw createError.BadRequest("Your authentication is not local authentication")
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

/**
 * Logout
 * @param {string} rTokenBody
 */
const logout = async (rTokenBody) => {
    const rToken = await tokenService.getOneToken({ body: rTokenBody, type: REFRESH })
    rToken.isRevoked = true
    await rToken.save()
}

/**
 * Refresh Auth tokens
 * @param {string} aToken
 * @param {string} rToken
 * @returns {Promise<{ accessToken, refreshToken }>}
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

    const rTokenInst = await tokenService.getOneToken({ body: rToken, type: REFRESH })

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

/**
 * Verify email
 * @param {string} verifyEmailToken
 */
const verifyEmail = async (verifyEmailToken) => {
    tokenService.verifyToken(verifyEmailToken, VERIFY_EMAIL)

    const tokenDoc = await tokenService.getOneToken({
        body: verifyEmailToken,
        type: VERIFY_EMAIL,
    })

    const user = await userService.getUserById(tokenDoc.user)

    await Promise.all([
        userService.updateUser(user, { isEmailVerified: true }),
        tokenService.deleteManyTokens({ user: user._id, type: VERIFY_EMAIL }),
    ])
}

/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 */
const resetPassword = async (resetPasswordToken, newPassword) => {
    tokenService.verifyToken(resetPasswordToken, RESET_PASSWORD)

    const tokenDoc = await tokenService.getOneToken({
        body: resetPasswordToken,
        type: RESET_PASSWORD,
    })

    const user = await userService.getUserById(tokenDoc.user)

    await Promise.all([
        userService.updateUser(user, { password: newPassword }),
        tokenService.deleteManyTokens({ user: user._id, type: RESET_PASSWORD }),
    ])
}

module.exports = {
    localLogin,
    logout,
    refreshAuthTokens,
    verifyEmail,
    resetPassword,
}

/**
 * @typedef {import('../models/User')} user
 *
 * @typedef {import('../models/Token')} token
 */
