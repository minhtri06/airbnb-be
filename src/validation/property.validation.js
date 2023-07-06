const Joi = require("joi")
const moment = require("moment")

const {
    request: { BODY, PARAMS, QUERY },
    accommodationGroupTypes: { ENTIRE_HOUSE, SPECIFIC_ROOM },
} = require("../constants")
const { property, district, province, booking, objectId, query } = require("./common")

module.exports = {
    createProperty: {
        [BODY]: Joi.object({
            title: property.title.required(),
            pageName: property.pageName.required(),
            address: property.address.required(),
            description: property.description,
            accommodationGroups: property.accommodationGroups,
        }),
    },

    searchProperties: {
        [QUERY]: Joi.object({
            districtId: objectId,
            provinceId: objectId,
            bookInDate: Joi.date().iso(),
            bookOutDate: Joi.date().iso(),
            page: query.page,
            limit: query.limit,
        }),
    },

    getPropertyById: {
        [PARAMS]: Joi.object({
            propertyId: objectId.required(),
        }),
        [QUERY]: Joi.object({
            bookInDate: booking.bookInDate,
            bookOutDate: booking.bookOutDate,
        }),
    },

    getPropertyByPageName: {
        [PARAMS]: Joi.object({
            pageName: property.pageName.required(),
        }),
        [QUERY]: Joi.object({
            bookInDate: booking.bookInDate,
            bookOutDate: booking.bookOutDate,
        }),
    },

    addAccommodationGroup: {
        [BODY]: Joi.object({
            newAccommodationGroup: property.accommodationGroup.required(),
        }),
        [PARAMS]: Joi.object({
            propertyId: objectId.required(),
        }),
    },

    addAccommodations: {
        [BODY]: Joi.object({
            newAccommodations: Joi.array()
                .min(1)
                .items({
                    roomCode: Joi.string().required(),
                })
                .required(),
        }),
        [PARAMS]: Joi.object({
            propertyId: objectId.required(),
            accomGroupId: objectId.required(),
        }),
    },

    replaceThumbnail: {
        [PARAMS]: Joi.object({
            propertyId: objectId.required(),
        }),
    },

    deleteImages: {
        [PARAMS]: Joi.object({
            propertyId: objectId.required(),
        }),
        [BODY]: Joi.object({
            deletedIndexes: Joi.array().max(100).items(Joi.number().min(0)).required(),
        }),
    },

    updateProperty: {
        [PARAMS]: Joi.object({
            propertyId: objectId.required(),
        }),
        [BODY]: Joi.object({
            title: property.title,
            isClosed: property.isClosed,
            pageName: property.pageName,
            description: property.description,
            facilities: property.facilities,
            address: property.address,
        }),
    },

    getBookingsOfAccom: {
        [PARAMS]: Joi.object({
            propertyId: objectId.required(),
            accomGroupId: objectId.required(),
            accomId: objectId.required(),
        }),
        [QUERY]: Joi.object({
            // Default is the first date of this month
            minBookIn: Joi.date().iso().default(moment(new Date()).set("date", 1)),
            // Default is the last date of this month
            maxBookIn: Joi.date().iso().default(moment().add(1, "month").set("date", 0)),
        }),
    },
}
