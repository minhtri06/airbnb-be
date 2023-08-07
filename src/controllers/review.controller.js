const createError = require("http-errors")

const { reviewService: service } = require("../services")

/** @type {controller} */
const addReview = async (req, res) => {
    req.body.reviewer = req.user._id
    const review = await service.createReview(req.body)
    return res.json({ review })
}

/** @type {controller} */
const editReview = async (req, res) => {
    await service.updateReview(req._review, req.body)
    return res.json({ review: req._review })
}

/** @type {controller} */
const getReviews = async (req, res) => {
    const { propertyId, limit, page, sortBy, checkPaginate } = req.query
    const results = await service.paginateReviews(
        { property: propertyId },
        {
            limit,
            page,
            sortBy,
            checkPaginate,
            populate: [{ path: "reviewer", select: "name avatar" }],
        },
    )

    return res.json({ ...results })
}

module.exports = { addReview, editReview, getReviews }

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
 *
 * @callback controller
 * @param {req} req
 * @param {res} res
 */
