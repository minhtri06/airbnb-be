const createError = require("http-errors")
const moment = require("moment")

const { Booking } = require("../models")
const envConfig = require("../configs/envConfig")

/**
 * @typedef {InstanceType<import('../models/Booking')>} booking
 *
 * @typedef {Object} bookingFilter
 * @property {string} guest
 * @property {string} property
 * @property {string} accomId
 * @property {string} propertyOwner
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

/**
 *
 * @param {bookingFilter} filter
 * @param {queryOptions} queryOptions
 * @returns
 */
const paginateBookings = async (filter, queryOptions) => {
    return await Booking.paginate(filter, queryOptions)
}

/**
 *
 * @param {number} month
 * @param {bookingFilter} filter
 * @returns
 */
const getBookingsInMonth = async (month, filter = {}) => {
    // First and last date in month 'month'
    const minBookIn = moment()
        .set("month", month - 1)
        .set("date", 1)
    const maxBookIn = moment().set("month", month).set("date", 0)

    filter.bookIn = { $gte: minBookIn, $lte: maxBookIn }

    return await Booking.find(filter).sort("bookIn")
}

module.exports = {
    createBooking,
    getBookingById,
    cancelBooking,
    paginateBookings,
    getBookingsInMonth,
}
