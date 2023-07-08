const envConfig = require("../../configs/envConfig")

const paginate = (schema) => {
    schema.statics.paginate = async function (filter, { sortBy, page, limit } = {}) {
        const query = this.find(filter)

        if (sortBy) {
            query.sort(sortBy)
        }

        page = page || 1
        limit = limit || envConfig.DEFAULT_PAGE_LIMIT
        const skip = (page - 1) * limit

        query.skip(skip).limit(limit)

        return query
    }
}

module.exports = paginate
