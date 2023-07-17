const createError = require("http-errors")

const { ADMIN } = require("../configs/roles")
const { reviewService: service } = require("../services")

/** @type {middleware} */
const getReviewById = async (req, res, next) => {
    req._review = await service.getReviewById(req.params.reviewId)
    return next()
}

/** @return {middleware} */
const requireToBeReviewer = ({ allowAdmin } = {}) => {
    return async (req, res, next) => {
        if (!req.user) {
            throw createError.Forbidden("Forbidden")
        }
        if (allowAdmin && req.user.role === ADMIN) {
            return next()
        }
        if (!req.user || !req.user._id.equals(req._review.reviewer)) {
            throw createError.Forbidden("Forbidden")
        }
        return next()
    }
}

module.exports = { getReviewById, requireToBeReviewer }

/**
 * @typedef {InstanceType<import("../models/Property")>} property
 * @typedef {InstanceType<import("../models/User")>} user
 * @typedef {InstanceType<import("../models/Review")>} review
 *
 * @typedef {{
 *   user: user,
 *   _user: user,
 *   _property: property,
 *   _review: review
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
