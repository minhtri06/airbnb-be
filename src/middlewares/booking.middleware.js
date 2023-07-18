const createError = require("http-errors")

const { ADMIN } = require("../configs/roles")
const { bookingService: service } = require("../services")

/** @type {middleware} */
const getBookingById = async (req, res, next) => {
    const booking = await service.getBookingById(req.params.bookingId)
    req._booking = booking
    return next()
}

/** @return {middleware} */
const requireToBeGuestOrPropertyOwner = ({ allowAdmin } = {}) => {
    return async (req, res, next) => {
        if (!req.user) {
            throw createError.Forbidden("Forbidden")
        }
        if (allowAdmin && req.user.role === ADMIN) {
            return next()
        }
        if (
            !req.user._id.equals(req._booking.guest) &&
            !req.user._id.equals(req._booking.propertyOwner)
        ) {
            throw createError.Forbidden("Forbidden")
        }
        return next()
    }
}

/** @return {middleware} */
const requireToBePropertyOwner = ({ allowAdmin } = {}) => {
    return async (req, res, next) => {
        if (!req.user) {
            throw createError.Forbidden("Forbidden")
        }
        if (allowAdmin && req.user.role === ADMIN) {
            return next()
        }
        if (!req.user || !req.user._id.equals(req._booking.propertyOwner)) {
            throw createError.Forbidden("Require to be property owner")
        }
        return next()
    }
}

module.exports = {
    getBookingById,
    requireToBeGuestOrPropertyOwner,
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
