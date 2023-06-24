const { connectMongoDb } = require("./src/db")
const { Property } = require("./src/models")

connectMongoDb().then(() => {
    const property = new Property({
        propertyType: "SpecificRoom",
        roomDetail: {
            title: "sdfdf",
            pricePerNight: 10,
            rooms: [{}],
        },
    })
    property.validate()
    console.log(property.roomDetail.rooms)
})
