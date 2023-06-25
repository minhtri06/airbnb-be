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
const addRooms = async (req, res) => {
    const { rooms, roomGroupIndex } = req.body
    console.log(req.params.propertyId)
    const property = await service.addRoom(
        req.params.propertyId,
        rooms,
        req.user._id,
        roomGroupIndex,
    )
    return res.json({ property })
}

module.exports = { createProperty, addRooms }
