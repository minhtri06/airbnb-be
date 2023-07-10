const createError = require("http-errors")

const { Review } = require("../models")
const { pickFields } = require("../utils")

/**
 * @typedef {Object} reviewFilter
 * @property {string} reviewer
 * @property {string} body
 * @property {number} score
 * @property {string} property
 *
 * @typedef {Object} queryOptions
 * @property {number} limit
 * @property {number} page
 * @property {Object} sortBy
 */

/**
 *
 * @param {reviewFilter} filter
 * @param {queryOptions} queryOptions
 * @returns
 */
const paginateReviews = async (filter, queryOptions) => {
    return await Review.paginate(filter, queryOptions)
}

const getReviewById = async (reviewId) => {
    const review = await Review.findById(reviewId)
    if (!review) {
        throw createError.NotFound("Review not found")
    }
    return review
}

const createReview = async (body) => {
    const review = new Review(body)
    return review.save()
}

const updateReview = async (review, updateBody) => {
    updateBody = pickFields(updateBody, "body", "score")
    Object.assign(review, updateBody)
    return review.save()
}

module.exports = { paginateReviews, getReviewById, createReview, updateReview }
