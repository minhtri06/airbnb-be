const createError = require("http-errors")
const { StatusCodes } = require("http-status-codes")

const { propertyService: service, bookingService, reviewService } = require("../services")

/**
 * @typedef {InstanceType<import('../models/Property')>} property
 *
 * @typedef {import('express').RequestHandler} controller
 */

/** @type  {controller}*/
const createProperty = async (req, res) => {
    req.body.owner = req.user._id
    const property = await service.createProperty(req.body)
    return res.status(StatusCodes.CREATED).json({ property })
}

/** @type {controller} */
const searchProperties = async (req, res) => {
    const properties = await service.searchProperties(req.query)
    return res.json({ properties })
}

/** @type {controller} */
const getProperty = async (req, res) => {
    const { bookIn, bookOut } = req.query
    if (bookIn && bookOut) {
        service.setAvailabilityFields(req.property, bookIn, bookOut)
    }
    /** @type {property} */
    const property = req.property
    if (req.user && property.owner.equals(req.user._id)) {
        property.caller.isOwner = true
    }
    return res.json({ property: req.property.toJSON({ virtuals: true }) })
}

/** @type {controller} */
const addAccommodationGroup = async (req, res) => {
    const { newAccommodationGroup } = req.body
    const property = await service.addAccommodationGroup(
        req.property,
        newAccommodationGroup,
    )
    return res.json({ property })
}

/** @type {controller} */
const getPropertyPendingBookings = async (req, res) => {
    /** @type {property} */
    const property = req.property
    req.query.lean = true
    let bookings = await bookingService.paginateBookings(
        {
            property: property._id,
            bookIn: { $gte: Date.now() },
            status: "pending",
        },
        req.query,
    )

    for (let booking of bookings) {
        const accomGroup = property.accommodationGroups.id(booking.accomGroupId)

        booking.availableAccoms = !accomGroup
            ? []
            : accomGroup.accommodations.filter((accom) => {
                  return service.isAccommodationAvailable(
                      accom,
                      booking.bookIn,
                      booking.bookOut,
                  )
              })
    }

    for (let booking of bookings) {
        for (let accom of booking.availableAccoms) {
            accom.currentBookingDates = undefined
        }
    }

    return res.json({ bookings })
}

/** @type {controller} */
const addAccommodations = async (req, res) => {
    const { newAccommodations } = req.body
    const property = await service.addAccommodations(
        req.property,
        req.accomGroup,
        newAccommodations,
    )
    return res.json({ property })
}

/** @type {controller} */
const replaceThumbnail = async (req, res) => {
    const thumbnail = await service.replaceThumbnail(req.property, req.file)
    return res.json({ thumbnail })
}

/** @type {controller} */
const addImages = async (req, res) => {
    const newImages = await service.addImages(req.property, req.files)
    return res.status(StatusCodes.CREATED).json({ newImages })
}

/** @type {controller} */
const deleteImages = async (req, res) => {
    const { deletedIndexes } = req.body
    await service.deleteImages(req.property, deletedIndexes)
    return res.status(StatusCodes.NO_CONTENT).send()
}

/** @type {controller} */
const deleteAccomGroup = async (req, res) => {
    await service.deleteAccomGroup(req.property._id, req.accomGroup._id)
    return res.json({ message: "Delete accommodation group successfully" })
}

/** @type {controller} */
const deleteAccom = async (req, res) => {
    await service.deleteAccom(req.property._id, req.accomGroup._id, req.accom._id)
    return res.json({ message: "Delete accommodation successfully" })
}

/** @type {controller} */
const updateProperty = async (req, res) => {
    await service.updateProperty(req.property, req.body)
    return res.status(StatusCodes.NO_CONTENT).send()
}

/** @type {controller} */
const getAccommodationBookings = async (req, res) => {
    const bookings = await bookingService.getBookingsInMonth(req.query.month, {
        accomId: req.accom._id,
    })
    return res.json({ bookings })
}

/** @type {controller} */
const getPropertyReviews = async (req, res) => {
    const reviews = await reviewService.paginateReviews(
        { property: req.property._id },
        req.query,
    )
    return res.json({ reviews })
}

/** @type {controller} */
const updateAccomGroup = async (req, res) => {
    await service.updateAccomGroup(req.property, req.accomGroup, req.body)
    return res.json({ message: "Update successfully" })
}

module.exports = {
    createProperty,
    searchProperties,
    getProperty,
    addAccommodationGroup,
    getPropertyPendingBookings,
    addAccommodations,
    replaceThumbnail,
    addImages,
    deleteImages,
    deleteAccomGroup,
    deleteAccom,
    updateProperty,
    getAccommodationBookings,
    getPropertyReviews,
    updateAccomGroup,
}
