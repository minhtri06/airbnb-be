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
const addAccommodations = async (req, res) => {
    const { propertyId, accomGroupId } = req.params
    const { newAccoms } = req.body
    const property = await service.addAccommodations(
        propertyId,
        req.user._id,
        accomGroupId,
        newAccoms,
    )
    return res.json({ property })
}

module.exports = { createProperty, addAccommodations }
