const Joi = require("joi")

const { booking, query, objectId } = require("./common")
const { BODY, QUERY, PARAMS, FILE } = require("../constants").request

module.exports = {
    createBooking: {
        [BODY]: Joi.object({
            bookIn: Joi.date().iso().greater(Date.now()).required(),
            bookOut: Joi.date().iso().greater(Date.now()).required(),
            property: objectId.required(),
            accomId: objectId.required(),
        }),
    },

    cancelBooking: {
        [PARAMS]: Joi.object({
            bookingId: objectId.required(),
        }),
    },

    approveBookingToAccom: {
        [PARAMS]: Joi.object({
            bookingId: objectId.required(),
        }),
        [BODY]: Joi.object({
            accomId: objectId.required(),
        }),
    },
}
