const { connectMongoDb } = require("./src/db")
const { Property, User } = require("./src/models")
const mongoose = require("mongoose")
const moment = require("moment")
const Joi = require("joi")

// connectMongoDb().then(async () => {
//     let property = await Property.findOne({ _id: "6499ba294cf56256943c0833" })
//     property = property.toObject()
//     addAvailabilityFieldsToProperty(property, "2023-06-03", "2023-06-04")
//     console.log(property.accommodationGroups[0].accommodations[1])
// })

const id = new mongoose.Types.ObjectId()
console.log(id)
