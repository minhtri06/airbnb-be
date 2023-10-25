const createError = require("http-errors")
const {
    StatusCodes: { BAD_REQUEST, FORBIDDEN, UNAUTHORIZED },
} = require("http-status-codes")
const qs = require("qs")
const axios = require("axios")
const jwt = require("jsonwebtoken")
const moment = require("moment")

const envConfig = require("../configs/envConfig")
const { NORMAL_USER } = require("../configs/roles")
const {
    tokenTypes: { ACCESS, REFRESH, RESET_PASSWORD, VERIFY_EMAIL },
    authTypes: { LOCAL, GOOGLE },
} = require("../constants")
const { User } = require("../models")
const userService = require("./user.service")
const tokenService = require("./token.service")

/**
 * Local login
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user, authTokens }>}
 */
const localLogin = async (email, password) => {
    const user = await userService.findOneUser({ email })

    if (!user) {
        throw createError(UNAUTHORIZED, "We cannot find user with your given email", {
            headers: { type: "incorrect-email" },
        })
    }

    if (user.authType !== LOCAL) {
        throw createError(BAD_REQUEST, "Your authentication is invalid", {
            headers: { type: "wrong-auth-type" },
        })
    }

    if (!(await user.isPasswordMatch(password))) {
        throw createError(UNAUTHORIZED, "Password did not match", {
            headers: { type: "incorrect-password" },
        })
    }

    if (!user.isEmailVerified) {
        throw createError(FORBIDDEN, "User email has not verified", {
            headers: { type: "email-un-verify" },
        })
    }

    const authTokens = await tokenService.createAuthTokens(user._id)

    return { user, authTokens }
}

/**
 * Get google oauth tokens
 * @param {string} code
 * @returns {Promise<{id_token: string}>}
 */
const getGoogleOauthTokens = async (code) => {
    const url = "https://oauth2.googleapis.com/token"
    const values = {
        code,
        client_id: envConfig.googleAuth.CLIENT_ID,
        client_secret: envConfig.googleAuth.CLIENT_SECRET,
        redirect_uri: envConfig.googleAuth.REDIRECT_URI,
        grant_type: "authorization_code",
    }
    const res = await axios.default.post(url + "?" + qs.stringify(values), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
    })
    return res.data
}

/**
 * Google by google oauth2
 * @param {string} code
 * @returns {Promise<{user: user, authTokens: {}}>}
 */
const googleLogin = async (code) => {
    const tokens = await getGoogleOauthTokens(code)

    const userProfile = jwt.decode(tokens.id_token)
    if (!userProfile.email_verified) {
        throw createError.Unauthorized("Your email is not verified")
    }

    const body = {
        name: userProfile.name,
        email: userProfile.email,
        avatar: userProfile.picture,
        authType: GOOGLE,
        role: NORMAL_USER,
    }
    let user = await userService.findOneUser({ email: userProfile.email })
    if (!user) {
        user = await userService.createUser(body)
    } else {
        await userService.updateUser(user, body)
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

    const accessPayload = tokenService.verifyToken(aToken, ACCESS, {
        ignoreExpiration: true,
    })
    const refreshPayload = tokenService.verifyToken(rToken, REFRESH, {
        ignoreExpiration: true,
    })

    const now = moment().unix()
    if (accessPayload.exp > now) {
        throw createError.Unauthorized("Access token has not expired")
    }
    if (refreshPayload.exp < now) {
        throw createError.Unauthorized("Refresh token has expired")
    }

    if (refreshPayload.sub !== accessPayload.sub) {
        throw createError.Unauthorized("Invalid token")
    }

    const rTokenDoc = await tokenService.getOneToken({ body: rToken, type: REFRESH })

    if (rTokenDoc.isBlacklisted) {
        throw createError.Unauthorized("Unauthorized")
    }

    const userId = refreshPayload.sub
    if (rTokenDoc.isUsed || rTokenDoc.isRevoked) {
        // Blacklist this token and all usable refresh tokens of that user
        rTokenDoc.isBlacklisted = true
        await rTokenDoc.save()
        await tokenService.blackListAUser(userId)
        throw createError.Unauthorized("Unauthorized")
    }

    rTokenDoc.isUsed = true
    await rTokenDoc.save()
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

/**
 * Change a password
 * @param {user} user
 * @param {string} oldPassword
 * @param {string} newPassword
 */
const changePassword = async (user, oldPassword, newPassword) => {
    if (user.authType === GOOGLE) {
        throw createError.BadRequest("Your account cannot change password")
    }

    if (!(await user.isPasswordMatch(oldPassword))) {
        throw createError.BadRequest("Old password is wrong")
    }
    await userService.updateUser(user, { password: newPassword })
}

module.exports = {
    localLogin,
    googleLogin,
    logout,
    refreshAuthTokens,
    verifyEmail,
    resetPassword,
    changePassword,
}

/**
 * @typedef {InstanceType<import('../models/User')>} user
 *
 * @typedef {InstanceType<import('../models/Token')>} token
 */
