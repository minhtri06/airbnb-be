const { Property } = require("../models")

const createProperty = async (body) => {
    const property = new Property(body)
    await property.save()
    return property
}

module.exports = {
    createProperty,
}
