const createError = require("http-errors")

const { userService, bookingService, propertyService } = require("../services")
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
    const queryOptions = pickFields(req.query, "limit", "page")

    const properties = await propertyService.paginateProperties(
        { owner: req.user._id, ...filter },
        {
            select: "-images -description -facilityCodes -owner -accommodationGroups",
            ...queryOptions,
        },
    )
    return res.json({ properties })
}

/** @type {controller} */
const getMyBookings = async (req, res) => {
    req.query.populate = [
        { path: "property", select: "thumbnail title pageName address score" },
    ]
    const bookings = await bookingService.paginateBookings(
        { guest: req.user._id },
        req.query,
    )
    return res.json({ bookings })
}

module.exports = {
    getMyProfile,
    updateMyProfile,
    replaceMyAvatar,
    getMyProperties,
    getMyBookings,
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
