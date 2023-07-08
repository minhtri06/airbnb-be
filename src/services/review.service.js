const createError = require("http-errors")

const { Review } = require("../models")

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

module.exports = { paginateReviews }
