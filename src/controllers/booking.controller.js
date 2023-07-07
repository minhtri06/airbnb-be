const createError = require("http-errors")

const { bookingService: service } = require("../services")

/** @type {import('express').RequestHandler} */
const createBooking = async (req, res) => {
    req.body.guest = req.user._id
    const booking = await service.createBooking(req.body)
    return res.json({ booking })
}

/** @type {import('express').RequestHandler} */
const getMyBookings = async (req, res) => {
    const bookings = await service.getMyBookings({ userId: req.user._id, ...req.query })
    return res.json({ bookings })
}

module.exports = { createBooking, getMyBookings }
