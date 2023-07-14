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
        }),
    },

    cancelBooking: {
        [PARAMS]: Joi.object({
            bookingId: objectId.required(),
        }),
    },
}
