const createError = require("http-errors")

const { Review, PropertyScoreChange } = require("../models")
const { pickFields } = require("../utils")

/**
 * Find one review, return null if not found
 * @param {reviewFilter} filter
 * @returns {Promise<review | null>}
 */
const findOneReview = async (filter) => {
    return Review.findOne(filter)
}

/**
 * Find review by id, return null if not found
 * @param {string} reviewId
 * @returns {Promise<review | null>}
 */
const findReviewById = async (reviewId) => {
    return findOneReview({ _id: reviewId })
}

/**
 * Get one review, throw error if not found
 * @param {reviewFilter} filter
 * @returns {Promise<review>}
 */
const getOneReview = async (filter) => {
    const review = await findOneReview(filter)
    if (!review) {
        throw createError.NotFound("Review not found")
    }
    return review
}

/**
 * Get review by id, throw error if not found
 * @param {string} reviewId
 * @returns {Promise<review>}
 */
const getReviewById = async (reviewId) => {
    const review = await getOneReview({ _id: reviewId })
    return review
}

/**
 * Paginate review
 * @param {reviewFilter} filter
 * @param {queryOptions} queryOptions
 * @returns {Promise<review[]>}
 */
const paginateReviews = async (filter, queryOptions) => {
    return await Review.paginate(filter, queryOptions)
}

/**
 * Create a review
 * @param {Object} body
 * @param {string} body.reviewer
 * @param {string} body.body
 * @param {number} body.score
 * @param {string} body.property
 * @returns
 */
const createReview = async (body) => {
    const review = new Review(body)

    await review.save()

    await PropertyScoreChange.create({
        scoreChange: review.score,
        property: review.property,
    })

    return review
}

/**
 * Update a review
 * @param {review} review
 * @param {{ body, score }} updateBody
 * @returns {Promise<review>}
 */
const updateReview = async (review, updateBody) => {
    updateBody = pickFields(updateBody, "body", "score")

    let previousScore
    if (updateBody.score !== review.score) {
        previousScore = updateBody.score
    }

    Object.assign(review, updateBody)

    await review.save()

    if (previousScore) {
        await PropertyScoreChange.insertMany([
            { scoreChange: -previousScore, property: review.property },
            { scoreChange: review.score, property: review.property },
        ])
    }

    return review
}

module.exports = {
    findOneReview,
    findReviewById,
    getOneReview,
    getReviewById,
    paginateReviews,
    createReview,
    updateReview,
}

/**
 * @typedef {InstanceType<Review>} review
 *
 * @typedef {Object} reviewFilter
 * @property {string} _id
 * @property {string} reviewer
 * @property {string} body
 * @property {number} score
 * @property {string} property
 *
 * @typedef {Object} queryOptions
 * @property {Object} sortBy
 * @property {number} page
 * @property {number} limit
 * @property {string} select
 * @property {string} populate
 * @property {boolean} lean
 */
