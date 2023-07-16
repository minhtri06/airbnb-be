const createError = require("http-errors")

const { propertyService: service } = require("../services")
const { ADMIN } = require("../configs/roles")

/** @type {import('express').RequestHandler} */
const getPropertyById = async (req, res, next) => {
    req.property = await service.getOneProperty({ _id: req.params.propertyId })
    next()
}

/** @type {import('express').RequestHandler} */
const getPropertyByPageName = async (req, res, next) => {
    req.property = await service.getOneProperty({
        pageName: req.params.pageName,
    })
    return next()
}

/**
 * Must call after getPropertyById middleware
 * @type {import('express').RequestHandler} */
const getAccomGroupById = async (req, res, next) => {
    const accomGroup = await service.getAccomGroupById(
        req.property,
        req.params.accomGroupId,
    )
    req.accomGroup = accomGroup
    return next()
}

/**
 * Must call after getAccomGroupById middleware
 * @type {import('express').RequestHandler} */
const getAccomById = async (req, res, next) => {
    const accom = await service.getAccomById(req.accomGroup, req.params.accomId)
    req.accom = accom
    return next()
}

/**
 * Must call after auth and getPropertyById middleware
 * @return {import('express').RequestHandler}*/
const requireToOwnProperty = ({ allowAdmin } = {}) => {
    return async (req, res, next) => {
        if (allowAdmin && req.user.roles.includes(ADMIN)) {
            return next()
        }
        if (!req.property.owner.equals(req.user._id)) {
            throw createError.Forbidden("Forbidden")
        }
        req.property.caller.isOwner = true
        return next()
    }
}

module.exports = {
    getPropertyById,
    getPropertyByPageName,
    getAccomGroupById,
    getAccomById,
    requireToOwnProperty,
}
