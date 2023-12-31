const Joi = require("joi")

const {
    accommodationTypes: { ENTIRE_HOUSE, SPECIFIC_ROOM },
} = require("../../constants")
const objectId = require("./objectId")

module.exports = {
    title: Joi.string(),
    isClosed: Joi.boolean(),
    owner: objectId,
    pageName: Joi.string(),
    categoryCodes: Joi.array().min(1).items(Joi.string()),
    description: Joi.string(),
    facilityCodes: Joi.array().items(Joi.string()),
    reviewCount: Joi.number().min(0),
    address: {
        address: Joi.string(),
        district: objectId,
        province: objectId,
        latitude: Joi.number(),
        longitude: Joi.number(),
    },
    accommodations: {
        title: Joi.string(),
        pricePerNight: Joi.number().integer().min(1),
        maximumOfGuests: Joi.number().integer().min(1),
        type: Joi.string().valid(ENTIRE_HOUSE, SPECIFIC_ROOM),
        bed: {
            double: Joi.number().integer().min(0),
            queen: Joi.number().integer().min(0),
            single: Joi.number().integer().min(0),
            sofaBed: Joi.number().integer().min(0),
        },
        numberOfRooms: Joi.number().integer().min(1),
        currentBookingDates: {
            bookIn: Joi.date().iso(),
            bookOut: Joi.date().iso(),
        },
    },
}
