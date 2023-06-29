const { connectMongoDb } = require("./src/db")
const { Property, User, Province } = require("./src/models")
const mongoose = require("mongoose")
const moment = require("moment")
const Joi = require("joi")

// connectMongoDb().then(async () => {
//     const province = await Province.findOne()
//     province.a = 10
//     console.log(province.toObject({ virtuals: true }))
// })

const a = {}
delete a.a
