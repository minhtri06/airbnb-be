const createError = require("http-errors")

const { bookingService: service } = require("../services")

/**
 * @typedef {InstanceType<import('../models/User')>} user
 * @typedef {InstanceType<import('../models/Booking')>} booking
 */

/** @type {import('express').RequestHandler} */
const getBookingById = async (req, res, next) => {
    const booking = await service.getBookingById(req.params.bookingId)
    if (!booking) {
        throw createError("Booking not found")
    }
    req.booking = booking
    return next()
}

/** @type {import('express').RequestHandler} */
const requireToBeBookingGuestOrPropOwner = async (req, res, next) => {
    const user = req.user
    const booking = req.booking
    if (user._id.equals(booking.guest) || user._id.equals(booking.propertyOwner)) {
        return next()
    }
    throw createError.Forbidden("Require to be guest or property owner")
}

module.exports = {
    getBookingById,
    requireToBeBookingGuestOrPropOwner,
}
