const { connectMongoDb } = require("./src/db")
const { Property, User, Province } = require("./src/models")
const mongoose = require("mongoose")
const moment = require("moment")
const Joi = require("joi")
const { createMongooseValidationErr } = require("./src/utils")

connectMongoDb().then(async () => {
    const property = new Property()
    console.log(property.validate())
})
