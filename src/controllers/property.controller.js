const createError = require("http-errors")
const { StatusCodes } = require("http-status-codes")

const { propertyService: service } = require("../services")

/** @type {import('express').RequestHandler} */
const createProperty = async (req, res) => {
    req.body.owner = req.user.id
    console.log(req.body)
    // const property = await service.createProperty(req.body)
    return res.status(StatusCodes.CREATED).json({ property: 1 })
}

module.exports = { createProperty }
