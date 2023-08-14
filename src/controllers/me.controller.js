const createError = require("http-errors")
const { StatusCodes } = require("http-status-codes")

const {
    userService,
    bookingService,
    propertyService,
    chatService,
} = require("../services")
const { pickFields } = require("../utils")

/** @type {controller} */
const getMyProfile = async (req, res) => {
    return res.json({ myProfile: req.user })
}

/** @type {controller} */
const updateMyProfile = async (req, res) => {
    const myProfile = await userService.updateUser(req.user, req.body)
    return res.json({ myProfile })
}

/** @type {controller} */
const replaceMyAvatar = async (req, res) => {
    if (!req.file) {
        throw createError.BadRequest("avatar is required")
    }
    const avatar = await userService.replaceUserAvatar(req.user, req.file)
    return res.json({ avatar })
}

/** @type {controller} */
const getMyProperties = async (req, res) => {
    const filter = pickFields(req.query, "isClosed")
    const queryOptions = pickFields(req.query, "limit", "page", "checkPaginate")

    const results = await propertyService.paginateProperties(
        { owner: req.user._id, ...filter },
        {
            select: "-images -description -facilityCodes -owner -accommodationGroups",
            ...queryOptions,
        },
    )
    return res.json({ ...results })
}

/** @type {controller} */
const getMyBookings = async (req, res) => {
    req.query.populate = [
        { path: "property", select: "thumbnail title pageName address score" },
    ]
    const results = await bookingService.paginateBookings(
        { guest: req.user._id },
        req.query,
    )
    return res.json({ ...results })
}

/** @type {controller} */
const getConversations = async (req, res) => {
    const conversations = await chatService.findManyConversations(
        { users: req.user._id },
        { sort: "-updatedAt" },
    )
    for (let c of conversations) {
        c.withUser = c.users.find((u) => !u.equals(req.user._id))
    }
    await chatService.populateConversations(conversations, {
        path: "withUser",
        select: "_id name avatar",
    })
    return res.json({ conversations })
}

/** @type {controller} */
const saveProperty = async (req, res) => {
    await userService.saveProperty(req.user._id, req.body.propertyId)
    return res.status(StatusCodes.NO_CONTENT).send()
}

/** @type {controller} */
const unSaveProperty = async (req, res) => {
    await userService.unSaveProperty(req.user._id, req.params.propertyId)
    return res.status(StatusCodes.NO_CONTENT).send()
}

module.exports = {
    getMyProfile,
    updateMyProfile,
    replaceMyAvatar,
    getMyProperties,
    getMyBookings,
    getConversations,
    saveProperty,
    unSaveProperty,
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
