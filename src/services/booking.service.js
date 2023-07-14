const createError = require("http-errors")
const moment = require("moment")

const { Booking, Property } = require("../models")
const { requireFields } = require("../utils")
const envConfig = require("../configs/envConfig")

/**
 *
 *  @typedef {InstanceType<import('../models/Booking')>} booking
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
 *
 */

const createBooking = async (body) => {
    requireFields(body, "bookIn", "bookOut", "guest", "property", "accomGroupId")

    const booking = new Booking(body)

    if (moment().isAfter(booking.bookIn)) {
        throw createError.BadRequest("bookIn must be after now")
    }

    if (booking.bookIn > booking.bookOut) {
        throw createError.BadRequest("bookIn must be before bookOut")
    }

    const { property, accomGroup } = await Property.getPropertyAndAccomGroup(
        booking.property,
        booking.accomGroupId,
    )

    if (!property || !accomGroup) {
        throw createError.NotFound("property or accomGroup not found")
    }

    booking.propertyOwner = property.owner
    booking.pricePerNight = accomGroup.pricePerNight
    booking.numberOfDays = moment(booking.bookOut).diff(booking.bookIn, "days")
    booking.totalPrice = booking.numberOfDays * booking.pricePerNight
    booking.status = "pending"
    booking.accomId = undefined

    return booking.save()
}

const getBookingById = async (bookingId) => {
    const booking = await Booking.findById(bookingId)
    return booking
}

/**
 * Approve a booking and assign it to a accommodation
 * @param {booking} booking
 * @param {string} accomId
 */
const approveBookingToAccom = async (booking, accomId) => {
    if (booking.bookIn < Date.now()) {
        throw createError.BadRequest("Cannot approve past booking")
    }
    if (!accomId) {
        throw createError.BadRequest("accomId is required")
    }

    // Verify booking availability of the accommodation
    if (
        await Booking.findOne({
            accomId,
            bookOut: { $gte: booking.bookIn },
            bookIn: { $lte: booking.bookOut },
            status: "booked",
        })
    ) {
        throw createError.NotAcceptable(
            `Already have another booking between ${booking.bookIn} - ${booking.bookOut}`,
        )
    }

    booking.accomId = accomId
    booking.status = "booked"

    // Add booking info to accommodation's currentBookingDates
    await Property.addCurrentBookingDateToAccom(
        booking.property,
        booking.accomGroupId,
        accomId,
        {
            _id: booking._id,
            bookIn: booking.bookIn,
            bookOut: booking.bookOut,
            guest: booking.guest,
        },
    )

    return booking.save()
}

/**
 * @param {booking} booking
 */
const cancelBooking = async (booking) => {
    if (moment().isAfter(booking.bookIn)) {
        throw createError.BadRequest("Cannot cancel past booking")
    }

    booking.status = "canceled"

    if (booking.accomId) {
        // If this booking has accomId and it's not until bookOut date,
        // this booking is still kept in the corresponding accom's currentBookingDates.
        // So we have to remove it
        await Property.removeCurrentBookingDateFromAccom(
            booking.property,
            booking.accomGroupId,
            booking.accomId,
            booking._id,
        )
    }

    return booking.save()
}

/**
 * @param {bookingFilter} filter
 * @param {queryOptions} queryOptions
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
    approveBookingToAccom,
    paginateBookings,
    getBookingsInMonth,
}
