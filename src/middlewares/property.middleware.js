const { propertyService: service } = require("../services")
const createError = require("http-errors")
const { ADMIN } = require("../configs/roles")

/** @return {import('express').RequestHandler} */
const getPropertyById = (select = undefined) => {
    return async (req, res, next) => {
        req.property = await service.getProperty({
            propertyId: req.params.propertyId,
            select,
        })
        next()
    }
}

/** @return {import('express').RequestHandler} */
const getPropertyByPageName = (select = undefined) => {
    return async (req, res, next) => {
        req.property = await service.getProperty({
            pageName: req.params.pageName,
            select,
        })
        next()
    }
}

/** @return {import('express').RequestHandler} */
const requireToOwnProperty = (allowAdmin = true) => {
    return async (req, res, next) => {
        if (!req.user || !req.property) {
            throw createError.NotFound("Property not found")
        }
        if (allowAdmin && req.user.roles.includes(ADMIN)) {
            next()
        }
        if (!req.property.owner.equals(req.user._id)) {
            throw createError.NotFound("Property not found")
        }
        next()
    }
}

module.exports = {
    getPropertyById,
    getPropertyByPageName,
    requireToOwnProperty,
}
