const createError = require("http-errors")
const { StatusCodes } = require("http-status-codes")

const {
    propertyService: service,
    bookingService,
    reviewService,
    userService,
} = require("../services")

/** @type {controller} */
const createProperty = async (req, res) => {
    req.body.owner = req.user._id
    const property = await service.createProperty(req.body)
    return res.status(StatusCodes.CREATED).json({ property })
}

/** @type {controller} */
const searchProperties = async (req, res) => {
    const properties = await service.searchProperties(req.query)

    // If user is authenticated => check save properties
    if (req.user) {
        const saveChecks = await userService.checkSaveProperties(
            req.user._id,
            properties.map((p) => p._id),
        )
        for (let i = 0; i < saveChecks.length; i++) {
            properties[i].isSaved = saveChecks[i]
        }
    }

    return res.json({ properties })
}

/** @type {controller} */
const getProperty = async (req, res) => {
    const { bookIn, bookOut } = req.query
    if (bookIn && bookOut) {
        service.setAvailabilityFields(req._property, bookIn, bookOut)
    }

    // If authenticated => check property saving
    if (req.user) {
        req._property.isSaved = await userService.isPropertySaved(
            req.user._id,
            req._property._id,
        )
    }

    return res.json({ property: req._property.toJSON({ virtuals: true }) })
}

/** @type {controller} */
const addAccommodation = async (req, res) => {
    await service.addAccommodation(req._property, req.body)
    const accommodations = req._property.accommodations
    return res.json({ accommodation: accommodations[accommodations.length - 1] })
}

/** @type {controller} */
const replaceThumbnail = async (req, res) => {
    const thumbnail = await service.replaceThumbnail(req._property, req.file)
    return res.json({ thumbnail })
}

/** @type {controller} */
const addImages = async (req, res) => {
    const newImages = await service.addImages(req._property, req.files)
    return res.status(StatusCodes.CREATED).json({ newImages })
}

/** @type {controller} */
const deleteImages = async (req, res) => {
    const { deletedIndexes } = req.body
    await service.deleteImages(req._property, deletedIndexes)
    return res.status(StatusCodes.NO_CONTENT).send()
}

/** @type {controller} */
const deleteAccommodation = async (req, res) => {
    if (req._accom.currentBookingDates.length !== 0) {
        await bookingService.cancelAllAccommodationBookings(req._property, req._accom)
    }
    await service.deleteAccommodation(req._property._id, req._accom._id)
    return res.status(StatusCodes.NO_CONTENT).send()
}

/** @type {controller} */
const updateProperty = async (req, res) => {
    await service.updateProperty(req._property, req.body)
    return res.status(StatusCodes.NO_CONTENT).send()
}

/** @type {controller} */
const getAccommodationBookings = async (req, res) => {
    const bookings = await bookingService.findBookingsInMonth(req.query.month, {
        accomId: req._accom._id,
    })
    return res.json({ bookings })
}

/** @type {controller} */
const getPropertyReviews = async (req, res) => {
    const reviews = await reviewService.paginateReviews(
        { property: req._property._id },
        req.query,
    )
    return res.json({ reviews })
}

/** @type {controller} */
const updateAccommodation = async (req, res) => {
    await service.updateAccommodation(req._property, req._accom, req.body)
    return res.json({ message: "Update successfully" })
}

module.exports = {
    createProperty,
    searchProperties,
    getProperty,
    addAccommodation,
    replaceThumbnail,
    addImages,
    deleteImages,
    deleteAccommodation,
    updateProperty,
    getAccommodationBookings,
    getPropertyReviews,
    updateAccommodation,
}

/**
 * @typedef {InstanceType<import("../models/Property")>} property
 * @typedef {InstanceType<import("../models/User")>} user
 *
 * @typedef {Object} accommodation
 * @property {string} _id
 * @property {string} title
 * @property {number} pricePerNight
 * @property {number} maximumOfGuests
 * @property { 'specific-room' | 'entire-house' } type
 * @property {Object} bed
 * @property {[]} rooms
 * @property {[]} currentBookingDates
 *
 * @typedef {{
 *   user: user,
 *   _user: user,
 *   _property: property,
 *   _accom: accommodation,
 * }} attachedData
 *
 * @typedef {import('express').Request & attachedData} req
 * @typedef {import('express').Response} res
 *
 * @callback controller
 * @param {req} req
 * @param {res} res
 */
