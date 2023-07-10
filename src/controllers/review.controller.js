const createError = require("http-errors")

const { reviewService: service } = require("../services")

/**
 * @typedef {import('express').RequestHandler} controller
 */

/** @type {controller} */
const addReview = async (req, res) => {
    req.body.reviewer = req.user._id
    const review = await service.createReview(req.body)
    return res.json({ review })
}

/** @type {controller} */
const editReview = async (req, res) => {
    await service.updateReview(req.review, req.body)
    return res.json({ review: req.review })
}

module.exports = { addReview, editReview }
