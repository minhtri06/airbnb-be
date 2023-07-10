const mongoose = require("mongoose")
const moment = require("moment")

const { createMongooseValidationErr } = require("../utils")
const { toJSON, paginate } = require("./plugins")
const Property = require("./Property")

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
        propertyOwner: { type: Schema.Types.ObjectId, ref: "User", immutable: true },
        accomGroupId: { type: Schema.Types.ObjectId, required: true, immutable: true },
        accomId: { type: Schema.Types.ObjectId, required: true, immutable: true },
        status: {
            type: String,
            required: true,
            enum: ["canceled", "booked"],
            default: "booked",
        },
        pricePerNight: { type: Number, min: 0, immutable: true },
        numberOfDays: { type: Number, min: 0, immutable: true },
        totalPrice: { type: Number, min: 0, immutable: true },
    },
    { timestamps: true },
)

bookingSchema.plugin(toJSON)
bookingSchema.plugin(paginate)

bookingSchema.statics.validateNewBookInBookOut = async (bookIn, bookOut, accomId) => {
    if (moment().isAfter(bookIn)) {
        throw createMongooseValidationErr("bookIn", "bookIn must be after now")
    }

    if (bookIn > bookOut) {
        throw createMongooseValidationErr(
            "bookIn, bookOut",
            "bookIn must be before bookOut",
        )
    }

    // Check availability
    if (
        await Booking.findOne({
            accomId,
            bookOut: { $gte: bookIn },
            bookIn: { $lte: bookOut },
            status: "booked",
        })
    ) {
        throw createMongooseValidationErr(
            "bookIn, bookOut",
            `Already have another booking between ${bookIn} - ${bookOut}`,
        )
    }
}

bookingSchema.pre("save", async function (next) {
    const booking = this

    if (booking.isNew) {
        await Booking.validateNewBookInBookOut(
            booking.bookIn,
            booking.bookOut,
            booking.accomId,
        )

        const { property, accomGroup, accom } =
            await Property.getPropertyAccomGroupAndAccom(
                booking.property,
                booking.accomGroupId,
                booking.accomId,
            )

        if (!property || !accomGroup || !accom) {
            throw createMongooseValidationErr(
                "property, accomGroupId, accomId",
                "property or accomGroup or accom not found",
            )
        }

        booking.propertyOwner = property.owner
        booking.pricePerNight = accomGroup.pricePerNight
        booking.numberOfDays = moment(booking.bookOut).diff(booking.bookIn, "days")
        booking.totalPrice = booking.numberOfDays * booking.pricePerNight
        booking.status = "booked"

        await Property.addCurrentBookingDateToAccom(
            booking.property,
            booking.accomGroupId,
            booking.accomId,
            {
                _id: booking._id,
                bookIn: booking.bookIn,
                bookOut: booking.bookOut,
                guest: booking.guest,
            },
        )
    }

    next()
})

bookingSchema.pre("save", async function (next) {
    const booking = this

    if (!booking.isNew) {
        if (booking.isModified("status") && booking.status === "canceled") {
            if (moment().isAfter(booking.bookIn)) {
                throw createMongooseValidationErr("status", "Cannot cancel past booking")
            }

            // If not until bookOut date, the corresponding accom's currentBookingDates
            // still keep this booking information. We have to remove it
            await Property.removeCurrentBookingDateFromAccom(
                booking.property,
                booking.accomGroupId,
                booking.accomId,
                booking._id,
            )
        }
    }

    next()
})

bookingSchema.index({ accomId: 1, bookIn: 1, bookOut: 1 })

const Booking = mongoose.model("Booking", bookingSchema)

module.exports = Booking
