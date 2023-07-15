const createError = require("http-errors")
const { StatusCodes } = require("http-status-codes")

const {
    authService: service,
    emailService,
    userService,
    tokenService,
} = require("../services")

/**
 * @typedef {import('express').RequestHandler} controller
 */

/** @type {controller} */
const registerUser = async (req, res) => {
    const user = await userService.createUser(req.body)

    const verifyEmailToken = await tokenService.createEmailVerifyToken(user._id)
    await emailService.sendVerificationEmail(user.email, verifyEmailToken)

    return res
        .status(StatusCodes.CREATED)
        .json({ message: "Verify your email to finish sign up", user })
}

/** @type {controller} */
const localLogin = async (req, res) => {
    const { email, password } = req.body
    const { user, authTokens } = await service.localLogin(email, password)
    return res.json({ user, authTokens })
}

/** @type {controller} */
const logout = async (req, res) => {
    await service.logout(req.body.refreshToken)
    return res.status(StatusCodes.NO_CONTENT).send()
}

/** @type {controller} */
const refreshToken = async (req, res) => {
    const { accessToken, refreshToken } = req.body
    const authTokens = await service.refreshAuthTokens(accessToken, refreshToken)
    return res.json({ authTokens })
}

/** @type {controller} */
const verifyEmail = async (req, res) => {
    await service.verifyEmail(req.query.token)
    return res.status(StatusCodes.NO_CONTENT).send()
}

/** @type {controller} */
const forgotPassword = async (req, res) => {
    const user = await userService.getUserByEmail(req.body.email)
    if (!user) {
        throw createError.NotFound("User not found")
    }
    const resetPasswordToken = await tokenService.createResetPasswordToken(user._id)
    await emailService.sendResetPasswordEmail(user.email, resetPasswordToken)
    return res.status(StatusCodes.NO_CONTENT).send()
}

/** @type {controller} */
const resetPassword = async (req, res) => {
    await service.resetPassword(req.query.token, req.body.newPassword)
    return res.status(StatusCodes.NO_CONTENT).send()
}

module.exports = {
    registerUser,
    localLogin,
    logout,
    refreshToken,
    verifyEmail,
    forgotPassword,
    resetPassword,
}
