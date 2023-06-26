const Joi = require("joi")

const {
    request: { BODY, PARAMS },
    accommodationGroupTypes: { ENTIRE_HOUSE, SPECIFIC_ROOM },
} = require("../constants")
const { property } = require("./common")

module.exports = {
    createProperty: {
        [BODY]: Joi.object({
            title: property.title.required(),
            pageName: property.pageName.required(),
            address: property.address.required(),
            accommodationGroups: property.accommodationGroups,
        }),
    },

    addAccommodationGroup: {
        [BODY]: Joi.object({
            newAccommodationGroup: property.accommodationGroup.required(),
        }),
        [PARAMS]: Joi.object({
            propertyId: property.id.required(),
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
    },
}
