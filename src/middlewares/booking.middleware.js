const createError = require("http-errors")

const { bookingService: service } = require("../services")

/** @type {import('express').RequestHandler} */
const getBookingById = async (req, res, next) => {
    const booking = service.getBookingById(req.params.bookingId)
    req.booking = booking
    return next()
}

module.exports = {
    getBookingById,
}
