const mongoose = require("mongoose")

const {
    accommodationTypes: { ENTIRE_HOUSE, SPECIFIC_ROOM },
} = require("../../constants")
const bedSchema = require("./bedSchema")

const { Schema } = mongoose

const accommodationSchema = new Schema({
    title: { type: String, trim: true, required: true },

    pricePerNight: { type: Number, min: 0, required: true },

    maximumGuest: { type: Number, min: 1, required: true },

    type: {
        type: String,
        enum: [ENTIRE_HOUSE, SPECIFIC_ROOM],
        required: true,
    },

    // For specific-room type
    bed: {
        type: bedSchema,
        required: function () {
            return this.get("type") === SPECIFIC_ROOM
        },
    },

    // For entire-house type
    rooms: {
        type: [{ bed: { type: bedSchema } }],
        required: function () {
            return this.get("type") === ENTIRE_HOUSE
        },
    },

    currentBookingDates: {
        type: [
            {
                bookIn: { type: Date, required: true, immutable: true },

                bookOut: { type: Date, required: true, immutable: true },
            },
        ],
        default: [],
        required: true,
    },
})

accommodationSchema.pre("validate", function (next) {
    const accom = this
    if (accom.type === SPECIFIC_ROOM) {
        accom.rooms = undefined
    }
    if (accom.type === ENTIRE_HOUSE) {
        accom.bed = undefined
    }
    return next()
})

accommodationSchema.virtual("isAvailable")

module.exports = accommodationSchema
