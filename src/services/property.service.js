const createError = require("http-errors")

const { Property, Booking, Review } = require("../models")
const envConfig = require("../configs/envConfig")
const {
    accommodationGroupTypes: { ENTIRE_HOUSE, SPECIFIC_ROOM },
    accommodationTypes: { ONE_ROOM, MULTI_ROOMS },
} = require("../constants")
const {
    pickFields,
    file: { deleteStaticFile, deleteManyStaticFiles },
} = require("../utils")

/**
 * @typedef {InstanceType<import('../models/Property')>} property
 *
 * @typedef {Object} propertyFilter
 * @property {string} title
 * @property {boolean} isClosed
 * @property {string} owner
 * @property {string} pageName
 * @property {number} score
 * @property {string} description
 * @property {[string]} facilities
 * @property {number} reviewCount
 * @property {Object} address
 * @property {string} thumbnail
 * @property {[string]} images
 * @property {[Object]} accommodationGroups
 *
 * @typedef {Object} queryOptions
 * @property {Object} sortBy
 * @property {number} page
 * @property {number} limit
 */

const createProperty = async (body) => {
    const property = new Property(body)
    await property.save()
    return property
}

/**
 *
 * @param {propertyFilter} filter
 * @param {queryOptions} queryOptions
 * @returns
 */
const paginateProperties = async (filter, queryOptions) => {
    return await Property.paginate(filter, queryOptions)
}

const isAccommodationAvailable = (accom, bookIn, bookOut) => {
    // We don't need to check in Booking, because its currentBookingDates keeps
    // all the future bookings. We just need to check currentBookingDates
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
    for (let accomGroup of property.accommodationGroups || []) {
        for (let accom of accomGroup.accommodations || []) {
            if (isAccommodationAvailable(accom, bookIn, bookOut)) {
                return true
            }
        }
    }
    return false
}

/**
 * @param { InstanceType<Property> | Object} property
 * @param {InstanceType<Date>} bookIn
 * @param {InstanceType<Date>} bookOut
 */
const setAvailabilityFields = (property, bookIn, bookOut) => {
    property.isAvailable = false

    for (let accomGroup of property.accommodationGroups || []) {
        accomGroup.availableCount = 0

        for (let accom of accomGroup.accommodations || []) {
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
    bookIn,
    bookOut,
    page,
    limit,
}) => {
    const query = Property.where({ isClosed: false })
        .lean()
        .select("-images -description -facilities")

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

    if (bookIn && bookOut) {
        if (!(bookIn instanceof Date) || !(bookOut instanceof Date)) {
            throw createError.BadRequest("bookIn and bookOut must be instances of Date")
        }
        if (bookIn >= bookOut) {
            throw createError.BadRequest("bookIn must be before bookOut")
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
                if (isPropertyAvailable(property, bookIn, bookOut)) {
                    skip--
                }
                continue
            }
            if (limit !== 0) {
                setAvailabilityFields(property, bookIn, bookOut)
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
    for (let property of properties) {
        Property.removeBookingDateFields(property)
    }
    return properties
}

const getProperty = async ({ propertyId, pageName, select }) => {
    const query = Property.findOne()

    if (propertyId) {
        query.where({ _id: propertyId })
    } else if (pageName) {
        query.where({ pageName })
    } else {
        throw createError.NotFound("Property not found")
    }

    if (select) {
        query.select(select)
    }

    const property = await query.exec()
    if (!property) {
        throw createError.NotFound("Property not found")
    }

    return property
}

/**
 *
 * @param {property} property
 * @param {Object} newAccomGroup
 * @returns
 */
const addAccommodationGroup = async (property, newAccomGroup) => {
    property.accommodationGroups.push(newAccomGroup)
    return property.save()
}

const getAccomGroupById = async (property, accomGroupId) => {
    const accomGroup = property.accommodationGroups.id(accomGroupId)
    if (!accomGroup) {
        throw createError.NotFound("Accommodation group not found")
    }
    return accomGroup
}

const getAccomById = (accomGroup, accomId) => {
    const accom = accomGroup.accommodations.id(accomId)
    if (!accom) {
        throw createError.NotFound("Accommodation not found")
    }
    return accom
}

const addAccommodations = async (property, accoGroup, newAccoms) => {
    if (newAccoms.length === 0) {
        throw new Error("newAccoms must have at least one accommodation")
    }
    accoGroup.accommodations.push(...newAccoms)
    return property.save()
}

/**
 * @param {property} property
 * @param {string} thumbnail
 */
const replaceThumbnail = async (property, thumbnailFile) => {
    const oldThumbnail = property.thumbnail
    property.thumbnail = `/img/${thumbnailFile.filename}`
    await property.save()
    // Delete old file after saving because saving may throw error.
    // If we delete first, we may lose the old file
    if (oldThumbnail) {
        deleteStaticFile(oldThumbnail)
    }
    return property.thumbnail
}

/**
 *
 * @param {property} property
 * @param {[]} imageFiles
 */
const addImages = async (property, imageFiles) => {
    if (!imageFiles) {
        throw createError.BadRequest("Images are required")
    }
    const newImages = imageFiles.map((file) => `/img/${file.filename}`)
    property.images.push(...newImages)
    await property.save()
    return newImages
}

/**
 *
 * @param {property} property
 * @param {number[]} deletedIndexes
 */
const deleteImages = async (property, deletedIndexes) => {
    if (deletedIndexes.length > 100) {
        throw createError.BadRequest("deletedIndexes length excess 100")
    }
    const deletedImgs = []
    property.images = property.images.filter((image, index) => {
        if (deletedIndexes.includes(index)) {
            deletedImgs.push(image)
            return false
        }
        return true
    })
    await property.save()
    await deleteManyStaticFiles(deletedImgs)
    return property.images
}

/**
 * @param {property} property
 * @param {Object} updateBody
 */
const updateProperty = async (property, updateBody) => {
    updateBody = pickFields(
        updateBody,
        "title",
        "isClosed",
        "pageName",
        "description",
        "facilities",
        "address",
    )
    Object.assign(property, updateBody)
    await property.updateOne(updateBody)
    return property
}

module.exports = {
    createProperty,
    paginateProperties,
    setAvailabilityFields,
    searchProperties,
    getProperty,
    addAccommodationGroup,
    getAccomGroupById,
    getAccomById,
    addAccommodations,
    replaceThumbnail,
    addImages,
    deleteImages,
    updateProperty,
}
