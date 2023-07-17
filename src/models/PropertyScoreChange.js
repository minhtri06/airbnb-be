const mongoose = require("mongoose")

const { Schema } = mongoose

const propertyScoreChangeSchema = new Schema({
    scoreChange: {
        type: Number,
        get: (v) => Math.round(v),
        set: (v) => Math.round(v),
        min: -10,
        max: 10,
        required: true,
    },
    property: { type: Schema.Types.ObjectId, ref: "Property", required: true },
})

const PropertyScoreChange = mongoose.model(
    "PropertyScoreChange",
    propertyScoreChangeSchema,
)

module.exports = PropertyScoreChange
