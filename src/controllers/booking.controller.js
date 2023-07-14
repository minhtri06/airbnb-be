const createError = require("http-errors")
const { StatusCodes } = require("http-status-codes")

const { bookingService: service } = require("../services")

/**
 * @typedef {import('express').RequestHandler} controller
 */

/** @type {controller} */
const createBooking = async (req, res) => {
    req.body.guest = req.user._id
    const booking = await service.createBooking(req.body)
    return res.json({ booking })
}

/** @type {controller} */
const cancelBooking = async (req, res) => {
    await service.cancelBooking(req.booking)
    return res.json({ message: "Cancel booking successfully" })
}

/** @type {controller} */
const approveBookingToAccom = async (req, res) => {
    await service.approveBookingToAccom(req.booking, req.body.accomId)
    return res.json({ message: "Approve booking successfully" })
}

module.exports = { createBooking, cancelBooking, approveBookingToAccom }
