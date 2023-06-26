const { connectMongoDb } = require("./src/db")
const { Property } = require("./src/models")

const addAccommodation = async (accommodationGroupId) => {
    const property = await Property.findOne({
        accommodationGroups: { _id: accommodationGroupId },
    })
    console.log(property)
}

connectMongoDb().then(async () => {
    const property = await Property.findOne({
        "accommodationGroups._id": "64995518ca2df4d0dc97a9e0",
    })
    const accoGroup = property.accommodationGroups.id("64995518ca2df4d0dc97a9e0")
    console.log(accoGroup)
})
