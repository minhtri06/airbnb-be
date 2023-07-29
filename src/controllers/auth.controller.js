const createError = require("http-errors")
const { StatusCodes } = require("http-status-codes")

const {
    authTypes: { LOCAL },
} = require("../constants")
const {
    authService: service,
    emailService,
    userService,
    tokenService,
} = require("../services")

/** @type {controller} */
const registerUser = async (req, res) => {
    const user = await userService.createUser(req.body)

    const verifyEmailTokenDoc = await tokenService.createVerifyEmailToken(user._id)
    await emailService.sendVerificationEmail(user.email, verifyEmailTokenDoc.body)

    return res.status(StatusCodes.CREATED).send()
}

/** @type {controller} */
const localLogin = async (req, res) => {
    const { email, password } = req.body
    const { user, authTokens } = await service.localLogin(email, password)

    return res.json({ user, authTokens })
}

/** @type {controller} */
const googleLogin = async (req, res) => {
    const { code } = req.query
    const { user, authTokens } = await service.googleLogin(code)
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
    const user = await userService.getOneUser({ email: req.body.email })

    if (user.authType !== LOCAL) {
        throw createError.BadRequest("You don't have password to forgot")
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
    googleLogin,
    logout,
    refreshToken,
    verifyEmail,
    forgotPassword,
    resetPassword,
}

/**
 * @typedef {InstanceType<import("../models/Property")>} property
 * @typedef {InstanceType<import("../models/User")>} user
 *
 * @typedef {{
 *   user: user,
 *   _user: user,
 *   _property: property
 * }} attachedData
 *
 * @typedef {import('express').Request & attachedData} req
 * @typedef {import('express').Response} res
 *
 * @callback controller
 * @param {req} req
 * @param {res} res
 */
