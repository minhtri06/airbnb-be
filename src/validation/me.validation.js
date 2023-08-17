const Joi = require("joi")
const { user, query, property, objectId } = require("./common")
const { BODY, QUERY, PARAMS } = require("../constants").request

module.exports = {
    updateMyProfile: {
        [BODY]: Joi.object({
            name: user.name,
            phoneNumber: user.phoneNumber.allow(null),
            dateOfBirth: user.dateOfBirth.allow(null),
            gender: user.gender.allow(null),
            address: user.address,
        }),
    },

    getMyProperties: {
        [QUERY]: Joi.object({
            limit: query.limit,
            page: query.page,
            isClosed: property.isClosed.default(false),
            checkPaginate: query.checkPaginate,
        }),
    },

    saveProperty: {
        [BODY]: Joi.object({
            propertyId: objectId.required(),
        }),
    },

    unSaveProperty: {
        [PARAMS]: Joi.object({
            propertyId: objectId.required(),
        }),
    },

    getMyBookings: {
        [QUERY]: Joi.object({
            limit: query.limit,
            page: query.page,
            // Default order is from the newest booking to the oldest booking
            sortBy: query.sortBy("bookIn").default("-bookIn"),
            checkPaginate: query.checkPaginate,
        }),
    },
}
