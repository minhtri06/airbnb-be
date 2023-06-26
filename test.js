const { connectMongoDb } = require("./src/db")
const { Property, User } = require("./src/models")

const addAccommodation = async (accommodationGroupId) => {
    const property = await Property.findOne({
        accommodationGroups: { _id: accommodationGroupId },
    })
    console.log(property)
}

// connectMongoDb().then(async () => {
//     const uCursor = User.where().cursor()
//     for (let user = await uCursor.next(); user !== null; user = await uCursor.next()) {
//         console.log(user)
//     }
// })

let a = undefined
a = a || 1
console.log(a)
