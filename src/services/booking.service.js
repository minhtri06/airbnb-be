const createError = require("http-errors")
const moment = require("moment")

const { Booking } = require("../models")
const { requireFields } = require("../utils")
const envConfig = require("../configs/envConfig")

/**
 * Find one booking, return null if not found
 * @param {bookingFilter} filter
 * @returns {Promise<booking | null>}
 */
const findOneBooking = async (filter) => {
    return Booking.findOne(filter)
}

/**
 * Find booking by id, return null if not found
 * @param {string} bookingId
 * @returns {Promise<booking | null>}
 */
const findBookingById = async (bookingId) => {
    return findOneBooking({ _id: bookingId })
}

/**
 * Get one booking, throw error if not found
 * @param {bookingFilter} filter
 * @returns {Promise<booking>}
 */
const getOneBooking = async (filter) => {
    const booking = await findOneBooking(filter)
    if (!booking) {
        throw createError.NotFound("Booking not found")
    }
    return booking
}

/**
 * Get booking by id, throw error if not found
 * @param {string} bookingId
 * @returns {Promise<booking>}
 */
const getBookingById = async (bookingId) => {
    const booking = await getOneBooking({ _id: bookingId })
    return booking
}

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
        const bookInStr = moment(booking.bookIn).format("D-MM-YYYY")
        const bookOutStr = moment(booking.bookOut).format("D-MM-YYYY")

        throw createError.NotAcceptable(
            `Already have another booking between ${bookInStr} and ${bookOutStr}`,
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
 * Cancel all bookings of an accommodation
 * @param {property} property
 * @param {accommodation} accom
 */
const cancelAllAccommodationBookings = async (property, accom) => {
    accom.currentBookingDates = []
    await Promise.all([
        Booking.updateMany({ accomId: accom._id }, { $set: { status: "canceled" } }),
        property.save(),
    ])
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
 * Find all bookings in specific month
 * @param {number} month
 * @param {bookingFilter} filter
 * @returns {Promise<booking[]>}
 */
const findBookingsInMonth = async (month, filter = {}) => {
    // First date in 'month'
    const minBookIn = moment()
        .set("month", month - 1)
        .set("date", 1)
    // Last date in 'month'
    const maxBookIn = moment().set("month", month).set("date", 0)

    filter.bookIn = { $gte: minBookIn, $lte: maxBookIn }

    return Booking.find(filter).sort("bookIn")
}

module.exports = {
    findOneBooking,
    findBookingById,
    getOneBooking,
    getBookingById,
    createBooking,
    cancelBooking,
    cancelAllAccommodationBookings,
    paginateBookings,
    findBookingsInMonth,
}

/**
 * @typedef {InstanceType<import('../models/Booking')>} booking
 * @typedef {InstanceType<import('../models/Property')>} property
 *
 * @typedef {Object} bookingFilter
 * @property {string} _id
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
 * @typedef {Object} accommodation
 * @property {string} _id
 * @property {string} title
 * @property {number} pricePerNight
 * @property {number} maximumOfGuests
 * @property { 'specific-room' | 'entire-house' } type
 * @property {Object} bed
 * @property {[]} rooms
 * @property {[]} currentBookingDates
 */
