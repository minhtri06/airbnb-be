const mongoose = require("mongoose")

const {
    accommodationGroupTypes: { ENTIRE_HOUSE, SPECIFIC_ROOM },
} = require("../constants")
const { toJSON, paginate } = require("./plugins")

const { Schema } = mongoose

const bookingSchema = new Schema(
    {
        bookIn: { type: Date, required: true, immutable: true },

        bookOut: { type: Date, required: true, immutable: true },

        guest: {
            type: Schema.Types.ObjectId,
            ref: "User",
            index: true,
            required: true,
            immutable: true,
        },

        property: {
            type: Schema.Types.ObjectId,
            ref: "Property",
            required: true,
            immutable: true,
        },

        propertyOwner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            immutable: true,
            required: true,
        },

        accomTitle: { type: String, required: true },

        accomType: {
            type: String,
            enum: [ENTIRE_HOUSE, SPECIFIC_ROOM],
            required: true,
        },

        accomId: { type: Schema.Types.ObjectId, required: true },

        status: {
            type: String,
            enum: ["booked", "canceled"],
            default: "booked",
            required: true,
        },

        pricePerNight: { type: Number, min: 0, required: true, immutable: true },

        numberOfDays: { type: Number, min: 0, required: true, immutable: true },

        totalPrice: { type: Number, min: 0, required: true, immutable: true },
    },
    { timestamps: true },
)

bookingSchema.plugin(toJSON)
bookingSchema.plugin(paginate)

bookingSchema.index({ accomId: 1, bookIn: 1, bookOut: 1 })
bookingSchema.index({ property: 1 })

const Booking = mongoose.model("Booking", bookingSchema)

module.exports = Booking
