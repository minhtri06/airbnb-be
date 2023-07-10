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

module.exports = { addReview }
