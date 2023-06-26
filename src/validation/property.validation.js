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

    addRooms: {
        [BODY]: Joi.object({
            rooms: Joi.array().items(
                Joi.object({
                    roomType: Joi.string(),
                    bedType: Joi.string(),
                    roomCode: Joi.string(),
                }),
            ),
            roomGroupIndex: Joi.number().integer(),
        }),
    },
}
