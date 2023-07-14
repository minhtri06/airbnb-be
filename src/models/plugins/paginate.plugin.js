const envConfig = require("../../configs/envConfig")

const paginate = (schema) => {
    schema.statics.paginate = async function (
        filter,
        { sortBy, page, limit, select, populate } = {},
    ) {
        const query = this.find(filter)

        if (sortBy) {
            query.sort(sortBy)
        }
        if (select) {
            query.select(select)
        }
        if (populate) {
            for (let populateOptions of populate) {
                query.populate(populateOptions)
            }
        }

        page = page || 1
        limit = limit || envConfig.DEFAULT_PAGE_LIMIT
        const skip = (page - 1) * limit

        query.skip(skip).limit(limit)

        return query
    }
}

module.exports = paginate
