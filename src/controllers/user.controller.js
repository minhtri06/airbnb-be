const { StatusCodes } = require("http-status-codes")
const createError = require("http-errors")

const { userService: service } = require("../services")

/** @type {controller} */
const getUserById = async (req, res) => {
    const user = await service.getUserById(req.params.userId)
    return res.json({ user })
}

/** @type {controller} */
const createUser = async (req, res) => {
    const user = await service.createUser(req.body)
    return res.status(StatusCodes.CREATED).json({ user })
}

/** @type {controller} */
const updateUser = async (req, res) => {
    const user = await service.updateUser(req.user, req.body)
    return res.json({ user })
}

module.exports = {
    getUserById,
    createUser,
    updateUser,
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
