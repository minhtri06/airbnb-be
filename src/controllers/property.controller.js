const createError = require("http-errors")
const { StatusCodes } = require("http-status-codes")

const { propertyService: service } = require("../services")

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
const addAccommodationGroup = async (req, res) => {
    const { propertyId } = req.params
    const { newAccommodationGroup } = req.body
    const property = await service.addAccommodationGroup(
        propertyId,
        req.user._id,
        newAccommodationGroup,
    )
    return res.json({ property })
}

/** @type {import('express').RequestHandler} */
const addAccommodations = async (req, res) => {
    const { propertyId, accomGroupId } = req.params
    const { newAccommodations } = req.body
    const property = await service.addAccommodations(
        propertyId,
        req.user._id,
        accomGroupId,
        newAccommodations,
    )
    return res.json({ property })
}

module.exports = {
    createProperty,
    searchProperties,
    addAccommodationGroup,
    addAccommodations,
}
