const createError = require("http-errors")
const { StatusCodes } = require("http-status-codes")

const { propertyService: service } = require("../services")

/**
 * @typedef {InstanceType<import('../models/Property')>} property
 */

/** @type {import('express').RequestHandler} */
const createProperty = async (req, res) => {
    req.body.owner = req.user._id
    const property = await service.createProperty(req.body)
    return res.status(StatusCodes.CREATED).json({ property })
}

/** @type {import('express').RequestHandler} */
const searchProperties = async (req, res) => {
    const properties = await service.searchProperties(req.query)
    return res.json({ properties })
}

/** @type {import('express').RequestHandler} */
const getProperty = async (req, res) => {
    const { bookInDate, bookOutDate } = req.query
    if (bookInDate && bookOutDate) {
        service.setAvailabilityFields(req.property, bookInDate, bookOutDate)
    }
    /** @type {property} */
    const property = req.property
    if (req.user && property.owner.equals(req.user._id)) {
        property.caller.isOwner = true
    }
    return res.json({ property: req.property.toJSON({ virtuals: true }) })
}

/** @type {import('express').RequestHandler} */
const addAccommodationGroup = async (req, res) => {
    const { newAccommodationGroup } = req.body
    const property = await service.addAccommodationGroup(
        req.property,
        newAccommodationGroup,
    )
    return res.json({ property })
}

/** @type {import('express').RequestHandler} */
const addAccommodations = async (req, res) => {
    const { newAccommodations } = req.body
    const property = await service.addAccommodations(
        req.property,
        req.accomGroup,
        newAccommodations,
    )
    return res.json({ property })
}

/** @type {import('express').RequestHandler} */
const getMyProperties = async (req, res) => {
    const myProperties = await service.getMyProperties(req.user._id)
    myProperties.forEach((property) => {
        property.caller.isOwner = true
    })
    return res.json({ myProperties })
}

/** @type {import('express').RequestHandler} */
const replaceThumbnail = async (req, res) => {
    const thumbnail = await service.replaceThumbnail(req.property, req.file)
    return res.json({ thumbnail })
}

/** @type {import('express').RequestHandler} */
const addImages = async (req, res) => {
    const newImages = await service.addImages(req.property, req.files)
    return res.status(StatusCodes.CREATED).json({ newImages })
}

/** @type {import('express').RequestHandler} */
const deleteImages = async (req, res) => {
    const { deletedIndexes } = req.body
    await service.deleteImages(req.property, deletedIndexes)
    return res.status(StatusCodes.NO_CONTENT).send()
}

/** @type {import('express').RequestHandler} */
const updateProperty = async (req, res) => {
    await service.updateProperty(req.property, req.body)
    return res.status(StatusCodes.NO_CONTENT).send()
}

module.exports = {
    createProperty,
    searchProperties,
    getProperty,
    addAccommodationGroup,
    addAccommodations,
    getMyProperties,
    replaceThumbnail,
    addImages,
    deleteImages,
    updateProperty,
}
