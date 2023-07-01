const mongoose = require("mongoose")

const { Schema } = mongoose

const reviewSchema = new Schema({
    reviewer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true },
    score: {
        type: Number,
        get: (v) => Math.round(v),
        set: (v) => Math.round(v),
        required: true,
    },
    property: {
        type: Schema.Types.ObjectId,
        ref: "Property",
        index: true,
        required: true,
    },
})

const Review = mongoose.model("Review", reviewSchema)

module.exports = Review
