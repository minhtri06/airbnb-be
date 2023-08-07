const mongoose = require("mongoose")

const { toJSON, paginate } = require("./plugins")
const Property = require("./Property")
const { createMongooseValidationErr } = require("../utils")

const { Schema } = mongoose

const reviewSchema = new Schema(
    {
        reviewer: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            immutable: true,
        },

        body: { type: String, required: true },

        score: {
            type: Number,
            get: (v) => Math.round(v),
            set: (v) => Math.round(v),
            min: 0,
            max: 10,
            required: true,
        },

        property: {
            type: Schema.Types.ObjectId,
            ref: "Property",
            index: true,
            required: true,
            immutable: true,
        },
    },

    { timestamps: true, optimisticConcurrency: true },
)

reviewSchema.plugin(paginate)

const Review = mongoose.model("Review", reviewSchema)

module.exports = Review
