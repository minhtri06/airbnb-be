const createError = require("http-errors")

const { ACCESS, REFRESH } = require("../constants").tokenTypes
const userService = require("./user.service")
const tokenService = require("./token.service")

const registerUser = async (userBody) => {
    const { name, email, password, dateOfBirth, gender, address } = userBody
    const user = await userService.createUser({
        name,
        email,
        password,
        dateOfBirth,
        gender,
        address,
    })
    const authTokens = await tokenService.createAuthTokens(user._id)
    return { user, authTokens }
}

const login = async (email, password) => {
    const user = await userService.getUserByEmail(email)
    if (!user) {
        throw createError.BadRequest("Email has not registered")
    }
    if (!(await user.isPasswordMatch(password))) {
        throw createError.BadRequest("Wrong password")
    }
    const authTokens = await tokenService.createAuthTokens(user._id)
    return { user, authTokens }
}

const logout = async (rTokenBody) => {
    const rToken = await tokenService.getRefreshTokenByTokenBody(rTokenBody)
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

    const rTokenInst = await tokenService.getRefreshTokenByTokenBody(rToken)
    if (!rTokenInst) {
        throw createError.BadRequest("Token not found")
    }
    if (rTokenInst.isBlacklisted || rTokenInst.accessToken !== aToken) {
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

module.exports = {
    registerUser,
    login,
    logout,
    refreshAuthTokens,
}
