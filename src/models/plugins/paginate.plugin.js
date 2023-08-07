const envConfig = require("../../configs/envConfig")

const paginate = (schema) => {
    schema.statics.paginate = async function (
        filter,
        { sortBy, page, limit, select, populate, lean, checkPaginate } = {},
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
        if (lean) {
            query.lean()
        }

        page = page || 1
        limit = limit || envConfig.DEFAULT_PAGE_LIMIT
        const skip = (page - 1) * limit

        query.skip(skip).limit(limit)

        if (checkPaginate) {
            const [data, totalRecords] = await Promise.all([
                query.exec(),
                this.countDocuments(filter).exec(),
            ])
            return { data, totalRecords, totalPage: Math.ceil(totalRecords / limit) }
        }
        const data = await query.exec()
        return { data }
    }
}

module.exports = paginate
