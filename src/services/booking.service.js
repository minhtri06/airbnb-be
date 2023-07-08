const createError = require("http-errors")
const moment = require("moment")

const { Booking } = require("../models")
const envConfig = require("../configs/envConfig")

/**
 * @typedef {InstanceType<import('../models/Booking')>} booking
 *
 * @typedef {Object} queryOptions
 * @property {number} queryOptions.limit
 * @property {number} queryOptions.page
 * @property {Object} queryOptions.sortBy
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

const queryBookings = async (filter, queryOptions) => {
    return await Booking.paginate(filter, queryOptions)
}

const queryBookingsByGuest = async (guestId, queryOptions) => {
    return await queryBookings({ guest: guestId }, queryOptions)
}

module.exports = {
    createBooking,
    getBookingById,
    cancelBooking,
    queryBookings,
    queryBookingsByGuest,
}
