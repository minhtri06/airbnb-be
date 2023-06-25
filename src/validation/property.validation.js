const Joi = require("joi")

const { BODY, PARAMS } = require("../constants").request
const { property } = require("./common")

module.exports = {
    createProperty: {
        [BODY]: Joi.object({
            title: property.title.required(),
            pageName: property.pageName.required(),
            address: property.address.required(),
            propertyType: property.propertyType.required(),
            houseDetail: property.houseDetail,
            roomGroupDetails: property.roomGroupDetails,
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
