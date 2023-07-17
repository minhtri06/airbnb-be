const createError = require("http-errors")
const moment = require("moment")

const { Booking } = require("../models")
const { requireFields } = require("../utils")
const envConfig = require("../configs/envConfig")

/**
 * Create new booking
 * @param {Object} body
 * @param {Date} body.bookIn
 * @param {Date} body.bookOut
 * @param {string} body.guest
 * @param {string} body.property
 * @param {string} body.accomId
 * @returns {Promise<booking>}
 */
const createBooking = async (body) => {
    const propertyService = require("./property.service")

    requireFields(body, "bookIn", "bookOut", "guest", "property", "accomId")

    const booking = new Booking(body)

    if (moment().isAfter(booking.bookIn)) {
        throw createError.BadRequest("bookIn must be after now")
    }
    if (booking.bookIn > booking.bookOut) {
        throw createError.BadRequest("bookIn must be before bookOut")
    }

    // Verify booking availability of the accommodation
    if (
        await Booking.findOne({
            accomId: booking.accomId,
            bookOut: { $gte: booking.bookIn },
            bookIn: { $lte: booking.bookOut },
            status: "booked",
        })
    ) {
        throw createError.NotAcceptable(
            `Already have another booking between ${booking.bookIn} - ${booking.bookOut}`,
        )
    }

    const { property, accom } = await propertyService.getPropertyAndAccommodation(
        booking.property,
        booking.accomId,
    )

    if (!property || !accom) {
        throw createError.NotFound("property or accommodation not found")
    }

    booking.propertyOwner = property.owner
    booking.pricePerNight = accom.pricePerNight
    booking.accomTitle = accom.title
    booking.accomType = accom.type
    booking.numberOfDays = moment(booking.bookOut).diff(booking.bookIn, "days")
    booking.totalPrice = booking.numberOfDays * booking.pricePerNight
    booking.status = "booked"

    // Add booking info to accommodation's currentBookingDates
    propertyService.addCurrentBookingDate(accom.currentBookingDates, {
        _id: booking._id,
        bookIn: booking.bookIn,
        bookOut: booking.bookOut,
    })

    await Promise.all([booking.save(), property.save()])

    return booking
}

/**
 * Get booking by id
 * @param {string} bookingId
 * @returns {Promise<booking>}
 */
const getBookingById = async (bookingId) => {
    const booking = await Booking.findById(bookingId)
    if (!booking) {
        throw createError.NotFound("Booking not found")
    }
    return booking
}

/**
 * Cancel a booking
 * @param {booking} booking
 * @returns {Promise<booking>}
 */
const cancelBooking = async (booking) => {
    const propertyService = require("./property.service")

    if (moment().isAfter(booking.bookIn)) {
        throw createError.BadRequest("Cannot cancel past booking")
    }

    booking.status = "canceled"

    // If not until bookOut date, this booking is still kept in the
    // corresponding accommodation's currentBookingDates.
    // So we have to remove it
    const { property, accom } = await propertyService.getPropertyAndAccommodation(
        booking.property,
        booking.accomId,
    )
    if (property && accom) {
        accom.currentBookingDates.pull(booking._id)
        await property.save()
    }

    return booking.save()
}

/**
 * Paginate booking
 * @param {bookingFilter} filter
 * @param {queryOptions} queryOptions
 * @return {Promise<booking[]>}
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
    // First date in 'month'
    const minBookIn = moment()
        .set("month", month - 1)
        .set("date", 1)
    // Last date in 'month'
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

/**
 *
 *  @typedef {InstanceType<import('../models/Booking')>} booking
 *
 * @typedef {Object} bookingFilter
 * @property {string} guest
 * @property {string} property
 * @property {string} accomId
 * @property {string} propertyOwner
 * @property {Date} bookIn
 * @property {Date} bookOut
 * @property {"pending" | "booked" | "canceled"} status
 *
 * @typedef {Object} queryOptions
 * @property {Object} sortBy
 * @property {number} page
 * @property {number} limit
 * @property {string} select
 * @property {string} populate
 * @property {boolean} lean
 *
 */
