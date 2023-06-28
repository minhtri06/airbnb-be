/**
 * Pick fields from obj if it has
 * @param {{}} obj
 * @param  {...string} fields
 */
const pickFields = (obj, ...fields) => {
    const pickedObj = {}
    if (obj) {
        for (let field of fields) {
            if (obj[field]) {
                pickedObj[field] = obj[field]
            }
        }
    }
    return pickedObj
}

module.exports = pickFields
