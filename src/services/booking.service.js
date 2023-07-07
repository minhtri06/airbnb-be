const createError = require("http-errors")

const { Booking } = require("../models")
const envConfig = require("../configs/envConfig")

const createBooking = async (body) => {
    const booking = new Booking(body)
    await booking.save()
    return booking
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

module.exports = { createBooking, getMyBookings }
