const { StatusCodes } = require("http-status-codes")
const createError = require("http-errors")

const { userService: service } = require("../services")

/** @type {import('express').RequestHandler} */
const getUsers = async (req, res) => {
    const users = await service.queryUser(req.query)
    return res.json({ users })
}

/** @type {import('express').RequestHandler} */
const getUserById = async (req, res) => {
    const user = await service.getUserById(req.params.userId)
    if (!user) {
        throw createError.NotFound("User not found")
    }
    return res.json({ user })
}

/** @type {import('express').RequestHandler} */
const createUser = async (req, res) => {
    const user = await service.createUser(req.body)
    return res.status(StatusCodes.CREATED).json({ user })
}

module.exports = {
    getUsers,
    getUserById,
    createUser,
}
