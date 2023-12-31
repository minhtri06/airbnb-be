const Joi = require("joi")

const { review, query, objectId } = require("./common")
const { BODY, QUERY, PARAMS } = require("../constants").request

module.exports = {
    addReview: {
        [BODY]: Joi.object({
            body: review.body.required(),
            score: review.score.required(),
            property: objectId.required(),
        }),
    },

    editReview: {
        [PARAMS]: Joi.object({
            reviewId: objectId.required(),
        }),
        [BODY]: Joi.object({
            body: review.body,
            score: review.score,
        }),
    },

    getReviews: {
        [QUERY]: Joi.object({
            propertyId: objectId.required(),
            limit: query.limit,
            page: query.page,
            sortBy: query.sortBy("createdAt", "score").default("-createdAt"),
            checkPaginate: query.checkPaginate,
        }),
    },
}
