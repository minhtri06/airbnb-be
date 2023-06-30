const Joi = require("joi")

const {
    accommodationGroupTypes: { ENTIRE_HOUSE, SPECIFIC_ROOM },
    accommodationTypes: { ONE_ROOM, MULTI_ROOMS },
} = require("../../constants")
const objectId = require("./objectId")

const accommodationGroup = {
    title: Joi.string().required(),
    pricePerNight: Joi.number().min(0).required(),
    type: Joi.string().valid(ENTIRE_HOUSE, SPECIFIC_ROOM).required(),

    // Just for specific-room
    bedType: Joi.when("type", {
        is: SPECIFIC_ROOM,
        then: Joi.string().required(),
        otherwise: Joi.forbidden(),
    }),

    accommodations: Joi.array()
        .min(1)
        .items({
            // Just for specific-room
            roomCode: Joi.when(Joi.ref("type", { ancestor: 3 }), {
                is: SPECIFIC_ROOM,
                then: Joi.string().required(),
                otherwise: Joi.forbidden(),
            }),

            // Just for entire-house
            rooms: Joi.when(Joi.ref("type", { ancestor: 3 }), {
                is: ENTIRE_HOUSE,
                then: Joi.array()
                    .min(1)
                    .items({
                        bedType: Joi.string().required(),
                        roomType: Joi.string().required(),
                    })
                    .required(),
                otherwise: Joi.forbidden(),
            }),
        })
        .required(),
}

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
    accommodationGroups: Joi.array().items(accommodationGroup),
    accommodationGroup: Joi.object(accommodationGroup),
}
