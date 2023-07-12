const Joi = require("joi")

const {
    accommodationGroupTypes: { ENTIRE_HOUSE, SPECIFIC_ROOM },
} = require("../../constants")
const objectId = require("./objectId")

module.exports = {
    title: Joi.string(),
    isClosed: Joi.boolean(),
    owner: objectId,
    pageName: Joi.string(),
    score: Joi.number().min(0).max(10),
    reviewCount: Joi.number().min(0),
    description: Joi.string(),
    facilities: Joi.array().items(Joi.string()),
    address: Joi.object({
        address: Joi.string().required(),
        district: objectId.required(),
        province: objectId.required(),
    }),
    images: Joi.array().items(Joi.string()),
    accommodationGroups: {
        title: Joi.string().required(),
        pricePerNight: Joi.number().min(0).required(),
        type: Joi.string().valid(ENTIRE_HOUSE, SPECIFIC_ROOM).required(),

        // Just for specific-room
        bedType: Joi.string(),

        accommodations: {
            roomCode: Joi.string(),

            // Just for entire-house
            rooms: {
                bedType: Joi.string(),
                roomType: Joi.string(),
            },
        },
    },
}
