const createError = require("http-errors")

const { reviewService: service } = require("../services")

/** @typedef {import('express').RequestHandler} middleware */

/** @type {middleware} */
const getReviewById = async (req, res, next) => {
    req.review = await service.getReviewById(req.params.reviewId)
    return next()
}

/** @type {middleware} */
const requireToBeReviewer = async (req, res, next) => {
    if (!req.user || !req.user._id.equals(req.review.reviewer)) {
        throw createError.Forbidden("Forbidden")
    }
    return next()
}

module.exports = { getReviewById, requireToBeReviewer }
