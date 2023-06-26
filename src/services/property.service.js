const createError = require("http-errors")

const { Property } = require("../models")
const {
    accommodationGroupTypes: { ENTIRE_HOUSE, SPECIFIC_ROOM },
    accommodationTypes: { ONE_ROOM, MULTI_ROOMS },
} = require("../constants")

const createProperty = async (body) => {
    const property = new Property(body)
    await property.save()
    return property
}

const getAccommodateOfProperty = (property, roomGroupIndex = undefined) => {
    if (property.propertyType === ENTIRE_HOUSE) {
        return property.houseDetail
    } else if (property.propertyType === SPECIFIC_ROOM) {
        if (roomGroupIndex !== 0 && !roomGroupIndex) {
            throw createError.BadRequest(
                `If propertyType is ${SPECIFIC_ROOM} then roomGroupIndex is required`,
            )
        }
        return property.roomGroupDetails[roomGroupIndex]
    }
}

const addRoom = async (propertyId, rooms, owner, roomGroupIndex = undefined) => {
    const property = await Property.findOne({ _id: propertyId, owner })
    if (!property) {
        throw createError.NotFound("Property not found")
    }
    const accommodate = getAccommodateOfProperty(property, roomGroupIndex)
    if (!accommodate) {
        throw createError.NotFound("Accommodate not found")
    }
    accommodate.rooms.push(...rooms)
    console.log(property.houseDetail)
    await property.save()
    return property
}

module.exports = {
    createProperty,
    addRoom,
}
