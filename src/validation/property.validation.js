const Joi = require("joi")
const moment = require("moment")

const {
    request: { BODY, PARAMS, QUERY },
    accommodationTypes: { ENTIRE_HOUSE, SPECIFIC_ROOM },
} = require("../constants")
const { property, district, province, booking, objectId, query } = require("./common")

const { accommodations, address } = property
const { bed, rooms } = accommodations

module.exports = {
    createProperty: {
        [BODY]: Joi.object({
            title: property.title.required(),
            isClosed: property.isClosed.required().default(false),
            pageName: property.pageName.required(),
            description: property.description.required(),
            facilityCodes: property.facilityCodes.required(),
            address: Joi.object({
                address: address.address.required(),
                district: address.district.required(),
                province: address.province.required(),
            }).required(),
            accommodations: Joi.array().items({
                title: accommodations.title.required(),
                pricePerNight: accommodations.pricePerNight.required(),
                maximumOfGuests: accommodations.maximumOfGuests.required(),
                type: accommodations.type.required(),
                bed: Joi.object({
                    double: bed.double.required(),
                    queen: bed.queen.required(),
                    single: bed.single.required(),
                    sofaBed: bed.sofaBed.required(),
                }),
                rooms: Joi.array().items({
                    bed: Joi.object({
                        double: bed.double.required(),
                        queen: bed.queen.required(),
                        single: bed.single.required(),
                        sofaBed: bed.sofaBed.required(),
                    }),
                }),
            }),
        }),
    },

    searchProperties: {
        [QUERY]: Joi.object({
            districtId: objectId,
            provinceId: objectId,
            bookIn: Joi.date().iso().greater(Date.now()),
            bookOut: Joi.date().iso().greater(Date.now()),
            page: query.page,
            limit: query.limit,
        }),
    },

    getPropertyById: {
        [PARAMS]: Joi.object({
            propertyId: objectId.required(),
        }),
        [QUERY]: Joi.object({
            bookIn: Joi.date().iso().greater(Date.now()),
            bookOut: Joi.date().iso().greater(Date.now()),
        }),
    },

    getPropertyByPageName: {
        [PARAMS]: Joi.object({
            pageName: property.pageName.required(),
        }),
        [QUERY]: Joi.object({
            bookIn: Joi.date().iso().greater(Date.now()),
            bookOut: Joi.date().iso().greater(Date.now()),
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
            facilityCodes: property.facilityCodes,
        }),
    },

    addAccommodation: {
        [PARAMS]: Joi.object({
            propertyId: objectId.required(),
        }),
        [BODY]: Joi.object({
            title: accommodations.title.required(),
            pricePerNight: accommodations.pricePerNight.required(),
            maximumOfGuests: accommodations.maximumOfGuests.required(),
            type: accommodations.type.required(),
            bed: Joi.object({
                double: bed.double.required(),
                queen: bed.queen.required(),
                single: bed.single.required(),
                sofaBed: bed.sofaBed.required(),
            }),
            rooms: Joi.array().items({
                bed: Joi.object({
                    double: bed.double.required(),
                    queen: bed.queen.required(),
                    single: bed.single.required(),
                    sofaBed: bed.sofaBed.required(),
                }),
            }),
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

    updateAccommodation: {
        [PARAMS]: Joi.object({
            propertyId: objectId.required(),
            accomId: objectId.required(),
        }),
        [BODY]: Joi.object({
            title: accommodations.title,
            pricePerNight: accommodations.pricePerNight,
            maximumOfGuests: accommodations.maximumOfGuests,
            bed: Joi.object({
                double: bed.double.required(),
                queen: bed.queen.required(),
                single: bed.single.required(),
                sofaBed: bed.sofaBed.required(),
            }),
            rooms: Joi.array().items({
                bed: Joi.object({
                    double: bed.double.required(),
                    queen: bed.queen.required(),
                    single: bed.single.required(),
                    sofaBed: bed.sofaBed.required(),
                }),
            }),
        }),
    },

    deleteAccommodation: {
        [PARAMS]: Joi.object({
            propertyId: objectId.required(),
            accomId: objectId.required(),
        }),
    },

    getAccommodationBookings: {
        [PARAMS]: Joi.object({
            propertyId: objectId.required(),
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
