const Joi = require("joi")
const moment = require("moment")

const {
    request: { BODY, PARAMS, QUERY },
    accommodationGroupTypes: { ENTIRE_HOUSE, SPECIFIC_ROOM },
} = require("../constants")
const { property, district, province, booking, objectId, query } = require("./common")

const { accommodationGroups } = property
const { accommodations } = accommodationGroups

module.exports = {
    createProperty: {
        [BODY]: Joi.object({
            title: property.title.required(),
            pageName: property.pageName.required(),
            address: property.address.required(),
            description: property.description,
            accommodationGroups: Joi.array().items({
                title: accommodationGroups.title.required(),
                pricePerNight: accommodationGroups.pricePerNight.required(),
                type: accommodationGroups.type.required(),
                bedType: accommodationGroups.bedType,
                accommodations: Joi.array()
                    .min(1)
                    .items({
                        roomCode: accommodations.roomCode,

                        // Just for entire-house
                        rooms: Joi.array().min(1).items({
                            bedType: accommodations.rooms.bedType.required(),
                            roomType: accommodations.rooms.roomType.required(),
                        }),
                    })
                    .required(),
            }),
        }),
    },

    searchProperties: {
        [QUERY]: Joi.object({
            districtId: objectId,
            provinceId: objectId,
            bookIn: Joi.date().iso(),
            bookOut: Joi.date().iso(),
            page: query.page,
            limit: query.limit,
        }),
    },

    getPropertyById: {
        [PARAMS]: Joi.object({
            propertyId: objectId.required(),
        }),
        [QUERY]: Joi.object({
            bookIn: booking.bookIn,
            bookOut: booking.bookOut,
        }),
    },

    getPropertyByPageName: {
        [PARAMS]: Joi.object({
            pageName: property.pageName.required(),
        }),
        [QUERY]: Joi.object({
            bookIn: booking.bookIn,
            bookOut: booking.bookOut,
        }),
    },

    addAccommodationGroup: {
        [BODY]: Joi.object({
            newAccommodationGroup: Joi.object({
                title: accommodationGroups.title.required(),
                pricePerNight: accommodationGroups.pricePerNight.required(),
                type: accommodationGroups.type.required(),
                bedType: accommodationGroups.bedType,
                accommodations: Joi.array()
                    .min(1)
                    .items({
                        roomCode: accommodations.roomCode,

                        rooms: Joi.array().min(1).items({
                            bedType: accommodations.rooms.bedType.required(),
                            roomType: accommodations.rooms.roomType.required(),
                        }),
                    })
                    .required(),
            }).required(),
        }),
        [PARAMS]: Joi.object({
            propertyId: objectId.required(),
        }),
    },

    getPropertyPendingBookings: {
        [PARAMS]: Joi.object({
            propertyId: objectId.required(),
        }),
        [QUERY]: Joi.object({
            limit: query.limit,
            page: query.page,
        }),
    },

    addAccommodations: {
        [PARAMS]: Joi.object({
            propertyId: objectId.required(),
            accomGroupId: objectId.required(),
        }),
        [BODY]: Joi.object({
            newAccommodations: Joi.array()
                .min(1)
                .items({
                    roomCode: accommodations.roomCode.required(),
                })
                .required(),
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

    updateAccomGroup: {
        [PARAMS]: Joi.object({
            propertyId: objectId.required(),
            accomGroupId: objectId.required(),
        }),
        [BODY]: Joi.object({
            title: accommodationGroups.title,
            pricePerNight: accommodationGroups.pricePerNight,
            bedType: accommodationGroups.bedType,
        }),
    },

    getAccommodationBookings: {
        [PARAMS]: Joi.object({
            propertyId: objectId.required(),
            accomGroupId: objectId.required(),
            accomId: objectId.required(),
        }),
        [QUERY]: Joi.object({
            // Default is this month
            month: Joi.number()
                .integer()
                .min(1)
                .max(12)
                .default(moment().month() + 1),
        }),
    },

    getPropertyReviews: {
        [PARAMS]: Joi.object({
            propertyId: objectId.required(),
        }),
        [QUERY]: Joi.object({
            limit: query.limit,
            page: query.page,
            sortBy: query.sortBy("createdAt", "score").default("-createdAt"),
        }),
    },
}
