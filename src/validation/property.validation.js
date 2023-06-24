const Joi = require("joi")

const { BODY, PARAMS } = require("../constants").request
const { property } = require("./common")

module.exports = {
    createProperty: {
        [BODY]: Joi.object({
            title: property.title.required(),
            pageUrl: property.pageUrl.required(),
            address: property.address.required(),
            propertyType: property.propertyType.required(),
            houseDetail: property.houseDetail,
            roomDetail: property.roomDetail,
        }),
    },
}
