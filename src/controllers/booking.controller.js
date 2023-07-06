const createError = require("http-errors")

const { bookingService: service } = require("../services")

/** @type {import('express').RequestHandler} */
const getMyBookings = async (req, res) => {
    console.log(req.query)
    const bookings = await service.getMyBookings({ userId: req.user._id, ...req.query })
    return res.json({ bookings })
}

module.exports = { getMyBookings }
