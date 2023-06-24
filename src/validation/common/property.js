const Joi = require("joi")

const { ENTIRE_HOUSE, SPECIFIC_ROOM } = require("../../constants").propertyType
const { objectId } = require("./custom")

module.exports = {
    id: Joi.string().custom(objectId),
    title: Joi.string(),
    isClosed: Joi.boolean(),
    owner: Joi.string().custom(objectId),
    pageUrl: Joi.string(),
    score: Joi.number().min(0).max(10),
    reviewCount: Joi.number().min(0),
    address: Joi.object({
        address: Joi.string().required(),
        district: Joi.string().custom(objectId).required(),
        province: Joi.string().custom(objectId).required(),
    }),
    images: Joi.array().items(Joi.string()),
    propertyType: Joi.string().valid(ENTIRE_HOUSE, SPECIFIC_ROOM),
    houseDetail: Joi.object({
        title: Joi.string().required(),
        pricePerNight: Joi.number().min(0).required(),
        rooms: Joi.array().items(
            Joi.object({
                roomType: Joi.string().required(),
                bedType: Joi.string().required(),
                roomCode: Joi.string().required(),
            }),
        ),
    }),
    roomDetail: Joi.object({
        title: Joi.string().required(),
        pricePerNight: Joi.number().min(0).required(),
        bedType: Joi.string().required(),
        rooms: Joi.array().items(
            Joi.object({
                roomCode: Joi.string().required(),
            }),
        ),
    }),
}
