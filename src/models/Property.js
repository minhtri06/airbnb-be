const mongoose = require("mongoose")

const { addressSchema, accommodationSchema } = require("./subdocs")
const { toJSON, paginate } = require("./plugins")
const { ENTIRE_HOUSE, SPECIFIC_ROOM } = require("../constants").accommodationTypes

const { Schema } = mongoose

const propertySchema = new Schema(
    {
        title: { type: String, trim: true, required: true },

        isClosed: { type: Boolean, default: false, required: true },

        owner: { type: Schema.Types.ObjectId, ref: "User", index: true, required: true },

        pageName: { type: String, unique: true, lowercase: true, required: true },

        score: { type: Number, min: 0, max: 10 },

        description: { type: String },

        facilityCodes: { type: [String] },

        reviewCount: {
            type: Number,
            get: function (value) {
                return Math.round(value)
            },
            set: function (value) {
                return Math.round(value)
            },
            default: 0,
            min: 0,
            required: true,
        },

        address: { type: addressSchema, default: () => ({}), required: true },

        thumbnail: { type: String },

        images: [String],

        accommodations: { type: [accommodationSchema] },
    },

    {
        toJSON: {
            transform: function (doc, ret) {
                delete ret.caller
            },
        },
        timestamps: true,
        optimisticConcurrency: true,
    },
)

propertySchema.plugin(toJSON)
propertySchema.plugin(paginate)

propertySchema.virtual("isAvailable")
propertySchema.virtual("caller.isOwner")

/**
 * Add current booking date to an accommodation so that bookIn is increasing
 * @param {string} propertyId
 * @param {string} accomId
 * @param {Object} newCBDate
 */
propertySchema.statics.addCBDateToAccom = function (propertyId, accomId, newCBDate) {
    const updateQuery = Property.updateOne(
        { _id: propertyId },
        {
            $push: {
                "accommodations.$[i].currentBookingDates": {
                    $each: [newCBDate],
                    $sort: { bookIn: 1 },
                },
            },
        },
        { arrayFilters: [{ "i._id": accomId }] },
    )
    return updateQuery
}

/**
 * Remove one currentBookingDates from an accommodation
 * @param {string} propertyId
 * @param {string} accomId
 * @param {string} removedCBDateId
 */
propertySchema.statics.removeCBDateFromAccom = function (
    propertyId,
    accomId,
    removedCBDateId,
) {
    const updateQuery = Property.updateOne(
        { _id: propertyId },
        {
            $pull: {
                "accommodations.$[i].currentBookingDates": {
                    _id: removedCBDateId,
                },
            },
        },
        { arrayFilters: [{ "i._id": accomId }] },
    )
    return updateQuery
}

const Property = mongoose.model("Property", propertySchema)

module.exports = Property
