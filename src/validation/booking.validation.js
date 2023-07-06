const Joi = require("joi")

const { booking, query } = require("./common")
const { BODY, QUERY, PARAMS, FILE } = require("../constants").request

module.exports = {
    getMyBookings: {
        [QUERY]: Joi.object({
            limit: query.limit,
            page: query.page,
            sortBy: query.sortBy("bookIn", "bookOut"),
        }),
    },
}
