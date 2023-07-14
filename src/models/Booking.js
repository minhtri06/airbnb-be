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
            required: true,
            index: true,
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
        accomGroupId: { type: Schema.Types.ObjectId, required: true, immutable: true },
        accomGroupTitle: { type: String, required: true },
        accomGroupType: {
            type: String,
            required: true,
            enum: [ENTIRE_HOUSE, SPECIFIC_ROOM],
        },
        accomId: { type: Schema.Types.ObjectId },
        status: {
            type: String,
            required: true,
            enum: ["pending", "booked", "canceled"],
            default: "pending",
            validate(status) {
                if (status === "pending") {
                    if (this.accomId) {
                        throw new Error("Cannot set accomId in pending booking")
                    }
                }
                if (status === "booked") {
                    if (!this.accomId) {
                        throw new Error("accomId is required in booked booking")
                    }
                }
            },
        },
        pricePerNight: { type: Number, min: 0, immutable: true, required: true },
        numberOfDays: { type: Number, min: 0, immutable: true, required: true },
        totalPrice: { type: Number, min: 0, immutable: true, required: true },
    },
    { timestamps: true },
)

bookingSchema.plugin(toJSON)
bookingSchema.plugin(paginate)

bookingSchema.index({ accomId: 1, bookIn: 1, bookOut: 1 })
bookingSchema.index({ property: 1 })

const Booking = mongoose.model("Booking", bookingSchema)

module.exports = Booking
