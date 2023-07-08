const createError = require("http-errors")
const moment = require("moment")

const { Booking } = require("../models")
const envConfig = require("../configs/envConfig")

/**
 * @typedef {InstanceType<import('../models/Booking')>} booking
 */

const createBooking = async (body) => {
    const booking = new Booking(body)
    await booking.save()
    return booking
}

const getBookingById = async (bookingId) => {
    const booking = await Booking.findById(bookingId)
    return booking
}

/**
 * @param {booking} booking
 */
const cancelBooking = async (booking) => {
    if (moment().isAfter(booking.bookIn)) {
        throw createError.BadRequest("Cannot cancel past booking")
    }
    booking.status = "canceled"
    await booking.save()
}

const getMyBookings = async ({ userId, sortBy, page, limit }) => {
    const query = Booking.find({ guest: userId })

    if (sortBy) {
        query.sort(sortBy)
    } else {
        query.sort("-bookIn")
    }

    limit = limit || envConfig.DEFAULT_PAGE_LIMIT
    page = page || 1
    let skip = (page - 1) * limit
    query.skip(skip).limit(limit)

    return await query.exec()
}

module.exports = { createBooking, getBookingById, cancelBooking, getMyBookings }
