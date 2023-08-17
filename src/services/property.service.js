const createError = require("http-errors")

const { Property } = require("../models")
const envConfig = require("../configs/envConfig")
const {
    pickFields,
    file: { deleteStaticFile, deleteManyStaticFiles },
} = require("../utils")

/**
 * Find one property, return null if not found
 * @param {propertyFilter} filter
 * @returns {Promise<property | null>}
 */
const findOneProperty = async (filter) => {
    return Property.findOne(filter)
}

/**
 * Find property by id, return null if not found
 * @param {string} propertyId
 * @returns {Promise<property | null>}
 */
const findPropertyById = async (propertyId) => {
    return findOneProperty({ _id: propertyId })
}

/**
 * Get one property, throw error if not found
 * @param {propertyFilter} filter
 * @returns {Promise<property>}
 */
const getOneProperty = async (filter) => {
    const property = await findOneProperty(filter)
    if (!property) {
        throw createError.NotFound("Property not found")
    }
    return property
}

/**
 * Get property by id, throw error if not found
 * @param {string} propertyId
 * @returns {Promise<property>}
 */
const getPropertyById = async (propertyId) => {
    const property = await getOneProperty({ _id: propertyId })
    return property
}

const createProperty = async (body) => {
    body = pickFields(
        body,
        "title",
        "isClosed",
        "owner",
        "pageName",
        "categoryCodes",
        "description",
        "facilityCodes",
        "address",
        "accommodations",
    )
    const property = new Property(body)
    property.score = null
    property.sumScore = 0
    property.reviewCount = 0
    return property.save()
}

/**
 * update Property
 * @param {property} property
 * @param {Object} updateBody
 */
const updateProperty = async (property, updateBody) => {
    updateBody = pickFields(
        updateBody,
        "title",
        "isClosed",
        "pageName",
        "categoryCodes",
        "description",
        "facilityCodes",
    )
    Object.assign(property, updateBody)
    return property.save()
}

/**
 * Paginate properties
 * @param {propertyFilter} filter
 * @param {queryOptions} queryOptions
 * @returns {Promise<property[]>}
 */
const paginateProperties = async (filter, queryOptions) => {
    return Property.paginate(filter, queryOptions)
}

/**
 * Check accommodation is available from bookIn date to bookOut date
 * @param {accommodation} accom
 * @param {Date} bookIn
 * @param {Date} bookOut
 * @returns {boolean}
 */
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

/**
 * Check property is available from bookIn date to bookOut date
 * @param {property} property
 * @param {Date} bookIn
 * @param {Date} bookOut
 * @returns {boolean}
 */
const isPropertyAvailable = (property, bookIn, bookOut) => {
    for (let accom of property.accommodations || []) {
        if (isAccommodationAvailable(accom, bookIn, bookOut)) {
            return true
        }
    }
    return false
}

/**
 * @param {property} property
 * @param {Date} bookIn
 * @param {Date} bookOut
 */
const setAvailabilityFields = (property, bookIn, bookOut) => {
    property.isAvailable = false

    for (let accom of property.accommodations || []) {
        // Check if this accommodation is available
        if (isAccommodationAvailable(accom, bookIn, bookOut)) {
            property.isAvailable = true
            accom.isAvailable = true
        } else {
            accom.isAvailable = false
        }
    }
}

/**
 * Search properties
 * @param {{
 *   districtId,
 *   provinceId,
 *   categoryCode,
 *   bookIn,
 *   bookOut,
 *   page,
 *   limit,
 * }} param0
 * @returns {Promise<{data: property[], totalRecords?: number, totalPage?: number}>}
 */
const searchProperties = async ({
    districtId,
    provinceId,
    categoryCode,
    bookIn,
    bookOut,
    page,
    limit,
    checkPaginate,
}) => {
    const filter = { isClosed: false }
    if (districtId) filter["address.district"] = districtId
    if (provinceId) filter["address.province"] = provinceId
    if (categoryCode) filter.categoryCodes = categoryCode
    const select = "-images -description -facilityCodes"
    const sort = "-score"

    if (!bookIn || !bookOut)
        return await paginateProperties(filter, {
            select,
            sortBy: sort,
            checkPaginate,
            lean: true,
            page,
            limit,
        })

    limit = limit || envConfig.DEFAULT_PAGE_LIMIT
    page = page || 1
    let skip = (page - 1) * limit

    const properties = await Property.find(filter).lean().select(select).sort(sort)

    const selectedProperties = []
    let skipCount = 0
    let selectedCount = 0
    let i = 0
    for (; i < properties.length && skipCount < skip; i++) {
        if (isPropertyAvailable(properties[i])) skipCount++
    }
    for (; i < properties.length && selectedCount < limit; i++) {
        setAvailabilityFields(properties[i])
        if (properties[i].isAvailable) {
            selectedProperties.push(properties[i])
            selectedCount++
        }
    }

    if (!checkPaginate) return { data: selectedProperties }

    let remainCount = 0
    for (; i < properties.length; i++) {
        if (isPropertyAvailable(properties[i])) remainCount++
    }
    const totalRecords = remainCount + skipCount + selectedCount
    console.log(totalRecords)
    return {
        data: selectedProperties,
        totalRecords,
        totalPage: Math.ceil(totalRecords / limit),
    }
}

/**
 * Replace thumbnail
 * @param {property} property
 * @param {Object} thumbnailFile
 */
const replaceThumbnail = async (property, thumbnailFile) => {
    const oldThumbnail = property.thumbnail?.split(envConfig.SERVER_URL)[1]
    property.thumbnail = `${envConfig.SERVER_URL}/img/${thumbnailFile.filename}`

    await property.save()

    // Delete old file after saving because saving may fail.
    // If we delete first, we may lose the old file
    if (oldThumbnail) {
        deleteStaticFile(oldThumbnail)
    }

    return property.thumbnail
}

/**
 * Add images
 * @param {property} property
 * @param {[]} imageFiles
 */
const addImages = async (property, imageFiles) => {
    if (!imageFiles) {
        throw createError.BadRequest("Images are required")
    }

    const newImages = imageFiles.map(
        (file) => `${envConfig.SERVER_URL}/img/${file.filename}`,
    )
    property.images.push(...newImages)
    await property.save()

    return newImages
}

/**
 * Delete images
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
            deletedImgs.push(image.split(envConfig.SERVER_URL)[1])
            return false
        }
        return true
    })
    await property.save()
    await deleteManyStaticFiles(deletedImgs)

    return property.images
}

/**
 * Add new accommodation
 * @param {property} property
 * @param {accommodation} newAccom
 * @returns {Promise<property>}
 */
const addAccommodation = async (property, newAccom) => {
    if (!newAccom) {
        throw createError.BadRequest("Accommodation is required")
    }

    newAccom = pickFields(
        newAccom,
        "title",
        "pricePerNight",
        "maximumOfGuests",
        "type",
        "bed",
        "numberOfRooms",
    )

    property.accommodations.push(newAccom)
    return property.save()
}

/**
 * Get accommodation by id
 * @param {property} property
 * @param {string} accomId
 * @returns {accommodation}
 */
const getAccommodationById = (property, accomId) => {
    const accom = property.accommodations.id(accomId)
    if (!accom) {
        throw createError.NotFound("Accommodation not found")
    }
    return accom
}

/**
 * Delete accommodation
 * @param {string} propertyId
 * @param {string} accomId
 */
const deleteAccommodation = async (propertyId, accomId) => {
    await Property.updateOne(
        { _id: propertyId },
        { $pull: { accommodations: { _id: accomId } } },
    )
}

/**
 * Update accommodation
 * @param {property} property
 * @param {accommodation} accom
 * @param {Object} updateBody
 * @returns {Promise<property>}
 */
const updateAccommodation = (property, accom, updateBody) => {
    updateBody = pickFields(
        updateBody,
        "title",
        "pricePerNight",
        "maximumOfGuests",
        "bed",
        "numberOfRooms",
    )
    Object.assign(accom, updateBody)
    return property.save()
}

/**
 * Get property and its accommodation
 * @param {string} propertyId
 * @param {string} accomId
 * @returns {Promise<{ property: property, accom: accommodation}>}
 */
const getPropertyAndAccommodation = async (propertyId, accomId) => {
    const property = await Property.findById(propertyId)
    const accom = property ? property.accommodations.id(accomId) : null
    return { property, accom }
}

/**
 * Add new current booking date to an existing currentBookingDates array
 * @param {Object[]} cBDates
 * @param {Object} newDate
 */
const addCurrentBookingDate = (cBDates, newDate) => {
    cBDates.push(newDate)
    cBDates.sort((a, b) => a.bookIn - b.bookIn)
}

module.exports = {
    findOneProperty,
    findPropertyById,
    getOneProperty,
    getPropertyById,
    createProperty,
    paginateProperties,
    isAccommodationAvailable,
    setAvailabilityFields,
    searchProperties,
    replaceThumbnail,
    addImages,
    deleteImages,
    addAccommodation,
    getAccommodationById,
    deleteAccommodation,
    updateProperty,
    updateAccommodation,
    getPropertyAndAccommodation,
    addCurrentBookingDate,
}

/**
 * @typedef {InstanceType<import('../models/Property')>} property
 *
 * @typedef {Object} accommodation
 * @property {string} _id
 * @property {string} title
 * @property {number} pricePerNight
 * @property {number} maximumOfGuests
 * @property { 'specific-room' | 'entire-house' } type
 * @property {Object} bed
 * @property {number} numberOfRooms
 * @property {[]} currentBookingDates
 *
 * @typedef {Object} propertyFilter
 * @property {string} _id
 * @property {string} title
 * @property {boolean} isClosed
 * @property {string} owner
 * @property {string} pageName
 * @property {string[] | string} categoryCodes
 * @property {number} score
 * @property {number} sumScore
 * @property {string} description
 * @property {string[]} facilityCodes
 * @property {number} reviewCount
 * @property {Object} address
 * @property {string} thumbnail
 * @property {string[]} images
 * @property {accommodation[]} accommodations
 *
 * @typedef {Object} queryOptions
 * @property {Object} sortBy
 * @property {number} page
 * @property {number} limit
 * @property {string} select
 * @property {string} populate
 * @property {boolean} lean
 * @property {boolean} checkPaginate
 */
