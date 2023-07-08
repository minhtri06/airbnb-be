const Joi = require("joi")

const { booking, query, objectId } = require("./common")
const { BODY, QUERY, PARAMS, FILE } = require("../constants").request

module.exports = {
    createBooking: {
        [BODY]: Joi.object({
            bookIn: booking.bookIn.required(),
            bookOut: booking.bookOut.required(),
            property: objectId.required(),
            accomGroupId: objectId.required(),
            accomId: objectId.required(),
        }),
    },

    cancelBooking: {
        [PARAMS]: Joi.object({
            bookingId: objectId.required(),
        }),
    },

    getMyBookings: {
        [QUERY]: Joi.object({
            limit: query.limit,
            page: query.page,
            sortBy: query.sortBy("bookIn", "bookOut"),
        }),
    },
}
