const Joi = require("joi")

module.exports = {
    sortBy: (...fields) =>
        Joi.string().custom((value, helpers) => {
            // value can be for example "-price,name,-createAt"
            const sortObj = {}
            for (let sort of value.split(",")) {
                let [field, order] = sort[0] === "-" ? [sort.slice(1), -1] : [sort, 1]
                if (fields.includes(field)) {
                    sortObj[field] = order
                }
            }
            return sortObj
        }),
    page: Joi.number().integer().min(1).max(50),
    limit: Joi.number().integer().min(0).max(100),
    checkPaginate: Joi.boolean(),
}
