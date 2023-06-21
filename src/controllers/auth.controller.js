const createError = require("http-errors")
const { StatusCodes } = require("http-status-codes")

const { authService: service } = require("../services")

/** @type {import('express').RequestHandler} */
const registerUser = async (req, res) => {
    const { user, authTokens } = await service.registerUser(req.body)
    return res.status(StatusCodes.CREATED).json({ user, authTokens })
}

module.exports = { registerUser }
