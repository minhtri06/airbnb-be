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
    { timestamps: true },
)

reviewSchema.post("save", async function (doc) {
    const review = doc
    const property = await Property.findById(review.property)
    if (!property) {
        await Review.deleteOne({ _id: review._id })
        throw createMongooseValidationErr("property", "Property not found")
    }

    if (review.isModified("score")) {
        // Re-evaluate property score
        property.score =
            (property.score * property.reviewCount + review.score) /
            (property.reviewCount + 1)
        property.reviewCount++
        await property.save()
    }
})

reviewSchema.plugin(toJSON)
reviewSchema.plugin(paginate)

const Review = mongoose.model("Review", reviewSchema)

module.exports = Review
