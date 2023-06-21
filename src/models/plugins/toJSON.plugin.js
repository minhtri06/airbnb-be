const deleteAtPath = (obj, pathAttrs) => {
    for (let i = 0; i < pathAttrs.length - 1; i++) {
        obj = obj[pathAttrs[i]]
    }
    delete obj[pathAttrs[pathAttrs.length - 1]]
}

const toJSON = (schema) => {
    schema.options.toJSON = schema.options.toJSON || {}
    const transform = schema.options.toJSON.transform || undefined

    schema.options.toJSON = Object.assign(schema.options.toJSON, {
        transform(doc, ret, options) {
            // delete paths that have option private = true
            Object.keys(schema.paths).forEach((path) => {
                if (schema.paths[path].options?.private) {
                    deleteAtPath(ret, path.split("."))
                }
            })

            // convert and delete unnecessary attributes
            ret.id = ret._id.toString()
            delete ret._id
            delete ret.__v
            delete ret.createdAt
            delete ret.updatedAt

            // If toJSON already has its own transform function, call it
            if (transform) {
                return transform(doc, ret, options)
            }
        },
    })
}

module.exports = toJSON
