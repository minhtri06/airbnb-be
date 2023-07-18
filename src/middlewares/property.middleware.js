const createError = require("http-errors")

const { propertyService: service } = require("../services")
const { ADMIN } = require("../configs/roles")

/** @type {middleware} */
const getPropertyById = async (req, res, next) => {
    req._property = await service.getOneProperty({ _id: req.params.propertyId })
    next()
}

/** @type {middleware} */
const getPropertyByPageName = async (req, res, next) => {
    req._property = await service.getOneProperty({
        pageName: req.params.pageName,
    })
    return next()
}

/**
 * Get accommodation by id
 * @type {middleware} */
const getAccommodationById = async (req, res, next) => {
    const accom = service.getAccommodationById(req._property, req.params.accomId)
    req._accom = accom
    return next()
}

/**
 * Must call after auth and getPropertyById middleware
 * @return {middleware}*/
const requireToBePropertyOwner = ({ allowAdmin } = {}) => {
    return async (req, res, next) => {
        if (!req.user) {
            throw createError.Forbidden("Forbidden")
        }
        if (allowAdmin && req.user.role === ADMIN) {
            return next()
        }
        if (!req._property.owner.equals(req.user._id)) {
            throw createError.Forbidden("Forbidden")
        }
        req._property.caller.isOwner = true
        return next()
    }
}

module.exports = {
    getPropertyById,
    getPropertyByPageName,
    getAccommodationById,
    requireToBePropertyOwner,
}

/**
 * @typedef {InstanceType<import("../models/Property")>} property
 * @typedef {InstanceType<import("../models/User")>} user
 * @typedef {InstanceType<import("../models/Booking")>} booking
 *
 * @typedef {{
 *   user: user,
 *   _user: user,
 *   _property: property,
 *   _booking: booking
 * }} attachedData
 *
 * @typedef {import('express').Request & attachedData} req
 * @typedef {import('express').Response} res
 * @typedef {import('express').NextFunction} next
 *
 * @callback middleware
 * @param {req} req
 * @param {res} res
 * @param {next} next
 */
