const createError = require("http-errors")

const { Property } = require("../models")
const envConfig = require("../configs/envConfig")
const {
    accommodationGroupTypes: { ENTIRE_HOUSE, SPECIFIC_ROOM },
    accommodationTypes: { ONE_ROOM, MULTI_ROOMS },
} = require("../constants")

const createProperty = async (body) => {
    const property = new Property(body)
    await property.save()
    return property
}

const isAccommodationAvailable = (accom, bookIn, bookOut) => {
    let isAvailable = false
    const cbDates = accom.currentBookingDates

    if (
        cbDates.length === 0 ||
        bookOut < cbDates[0].bookIn ||
        bookIn > cbDates[cbDates.length - 1].bookOut
    ) {
        isAvailable = true
    } else {
        for (let i = 1; i < cbDates.length; i++) {
            if (bookOut < cbDates[i].bookIn) {
                if (bookIn > cbDates[i - 1].bookOut) {
                    isAvailable = true
                }
                break
            }
        }
    }
    return isAvailable
}

const isPropertyAvailable = (property, bookIn, bookOut) => {
    for (let accomGroup of property.accommodationGroups) {
        for (let accom of accomGroup.accommodations) {
            if (isAccommodationAvailable(accom, bookIn, bookOut)) {
                return true
            }
        }
    }
    return false
}

/**
 * @param {{
 *  accommodationGroups: [{
 *      accommodations
 *  }]
 * }} property
 * @param {InstanceType<Date>} bookIn
 * @param {InstanceType<Date>} bookOut
 */
const addAvailabilityFieldsToProperty = (property, bookIn, bookOut) => {
    property.isAvailable = false

    for (let accomGroup of property.accommodationGroups) {
        accomGroup.availableCount = 0

        for (let accom of accomGroup.accommodations) {
            // Check if this accommodation is available
            if (isAccommodationAvailable(accom, bookIn, bookOut)) {
                property.isAvailable = true
                accomGroup.availableCount++
                accom.isAvailable = true
            } else {
                accom.isAvailable = false
            }
        }
    }
}

const searchProperties = async ({
    districtId,
    provinceId,
    bookInDate,
    bookOutDate,
    page,
    limit,
}) => {
    const query = Property.where({ isClosed: false })
        .lean()
        .select("-selectedQuestions -images -description -facilities")

    if (districtId) {
        query.where({ "address.district": districtId })
    }
    if (provinceId) {
        query.where({ "address.province": provinceId })
    }

    let properties
    limit = limit || envConfig.DEFAULT_PAGE_LIMIT
    page = page || 1
    let skip = (page - 1) * limit

    if (bookInDate && bookOutDate) {
        if (!(bookInDate instanceof Date) || !(bookOutDate instanceof Date)) {
            throw createError.BadRequest(
                "bookInDate and bookOutDate must be instances of Date",
            )
        }
        if (bookInDate >= bookOutDate) {
            throw createError.BadRequest("bookInDate must be before bookOutDate")
        }

        // Find available properties
        const cursor = query.cursor()
        properties = []
        for (
            let property = await cursor.next();
            property !== null;
            property = await cursor.next()
        ) {
            if (skip !== 0) {
                if (isPropertyAvailable(property, bookInDate, bookOutDate)) {
                    skip--
                }
                continue
            }
            if (limit !== 0) {
                addAvailabilityFieldsToProperty(property, bookInDate, bookOutDate)
                if (property.isAvailable) {
                    limit--
                    properties.push(property)
                }
            }
            if (limit === 0 && skip === 0) {
                break
            }
        }
    } else {
        query.skip(skip).limit(limit)
        properties = await query.exec()
    }
    return properties
}

const addAccommodationGroup = async (propertyId, ownerId, newAccomGroup) => {
    const property = await Property.findOne({ _id: propertyId, owner: ownerId })
    if (!property) {
        throw createError.NotFound("Property not found")
    }
    property.accommodationGroups.push(newAccomGroup)
    await property.save()
    return property
}

const addAccommodations = async (propertyId, ownerId, accomGroupId, newAccoms) => {
    if (newAccoms.length === 0) {
        throw new Error("newAccoms must have at least one accommodation")
    }
    const property = await Property.findOne({ _id: propertyId, owner: ownerId })
    if (!property) {
        throw createError.NotFound("Property not found")
    }
    const accoGroup = property.accommodationGroups.id(accomGroupId)
    if (!accoGroup) {
        throw createError.NotFound("Accommodation group not found")
    }
    accoGroup.accommodations.push(...newAccoms)
    await property.save()
    return property
}

module.exports = {
    createProperty,
    searchProperties,
    addAccommodationGroup,
    addAccommodations,
}