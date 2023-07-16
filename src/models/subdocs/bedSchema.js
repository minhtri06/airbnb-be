const mongoose = require("mongoose")

const { Schema } = mongoose

const bedSchema = new Schema({
    double: { type: Number, min: 0, max: 20, default: 0, required: true },
    queen: { type: Number, min: 0, max: 20, default: 0, required: true },
    single: { type: Number, min: 0, max: 20, default: 0, required: true },
    sofaBed: { type: Number, min: 0, max: 20, default: 0, required: true },
})

module.exports = bedSchema
