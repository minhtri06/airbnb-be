const createError = require("http-errors")
const { StatusCodes } = require("http-status-codes")

const { bookingService: service } = require("../services")

/** @type {import('express').RequestHandler} */
const createBooking = async (req, res) => {
    req.body.guest = req.user._id
    const booking = await service.createBooking(req.body)
    return res.json({ booking })
}

/** @type {import('express').RequestHandler} */
const cancelBooking = async (req, res) => {
    await service.cancelBooking(req.booking)
    return res.status(StatusCodes.NO_CONTENT).send()
}

module.exports = { createBooking, cancelBooking }
