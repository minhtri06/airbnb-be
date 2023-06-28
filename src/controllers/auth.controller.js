const createError = require("http-errors")
const { StatusCodes } = require("http-status-codes")

const { authService: service } = require("../services")

/** @type {import('express').RequestHandler} */
const registerUser = async (req, res) => {
    const { user, authTokens } = await service.registerUser(req.body)
    return res.status(StatusCodes.CREATED).json({ user, authTokens })
}

/** @type {import('express').RequestHandler} */
const login = async (req, res) => {
    const { email, password } = req.body
    const { user, authTokens } = await service.login(email, password)
    return res.json({ user, authTokens })
}

/** @type {import('express').RequestHandler} */
const logout = async (req, res) => {
    await service.logout(req.body.refreshToken)
    return res.status(StatusCodes.NO_CONTENT).send()
}

/** @type {import('express').RequestHandler} */
const refreshToken = async (req, res) => {
    const { accessToken, refreshToken } = req.body
    const authTokens = await service.refreshAuthTokens(accessToken, refreshToken)
    return res.json({ authTokens })
}

module.exports = { registerUser, login, logout, refreshToken }
