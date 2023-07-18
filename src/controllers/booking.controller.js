const createError = require("http-errors")
const { StatusCodes } = require("http-status-codes")

const { bookingService: service } = require("../services")

/** @type {controller} */
const createBooking = async (req, res) => {
    req.body.guest = req.user._id
    const booking = await service.createBooking(req.body)
    return res.json({ booking })
}

/** @type {controller} */
const cancelBooking = async (req, res) => {
    await service.cancelBooking(req._booking)
    return res.json({ message: "Cancel booking successfully" })
}

module.exports = { createBooking, cancelBooking }

/**
 * @typedef {InstanceType<import("../models/Property")>} property
 * @typedef {InstanceType<import("../models/User")>} user
 * @typedef {InstanceType<import("../models/Booking")>} booking
 *
 * @typedef {{
 *   user: user,
 *   _user: user,
 *   _property: property,
 *   _booking: booking
 * }} attachedData
 *
 * @typedef {import('express').Request & attachedData} req
 * @typedef {import('express').Response} res
 *
 * @callback controller
 * @param {req} req
 * @param {res} res
 */
