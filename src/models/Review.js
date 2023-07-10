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

reviewSchema.pre("save", async function (next) {
    const review = this

    if (review.isModified("score", "property")) {
        const property = await Property.findById(review.property)
        if (!property) {
            await Review.deleteOne({ _id: review._id })
            throw createMongooseValidationErr("property", "Property not found")
        }

        // Re-evaluate property score
        if (property.reviewCount === 0) {
            property.score = review.score
            property.reviewCount = 1
        } else {
            property.score =
                (property.score * property.reviewCount + review.score) /
                (property.reviewCount + 1)
            property.reviewCount++
        }

        await property.save()
    }

    return next()
})

reviewSchema.plugin(toJSON)
reviewSchema.plugin(paginate)

const Review = mongoose.model("Review", reviewSchema)

module.exports = Review
