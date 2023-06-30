const Joi = require("joi")

const {
    request: { BODY, PARAMS, QUERY },
    accommodationGroupTypes: { ENTIRE_HOUSE, SPECIFIC_ROOM },
} = require("../constants")
const { property, district, province, booking, objectId } = require("./common")

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
            page: Joi.number().integer().min(1).max(50),
            limit: Joi.number().integer().min(0).max(100),
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
}
