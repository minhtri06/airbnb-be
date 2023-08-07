const mongoose = require("mongoose")

const {
    accommodationTypes: { ENTIRE_HOUSE, SPECIFIC_ROOM },
} = require("../../constants")
const bedSchema = require("./bedSchema")

const { Schema } = mongoose

const accommodationSchema = new Schema({
    title: { type: String, trim: true, required: true },

    pricePerNight: { type: Number, min: 0, required: true },

    maximumOfGuests: { type: Number, min: 1, required: true },

    type: {
        type: String,
        enum: [ENTIRE_HOUSE, SPECIFIC_ROOM],
        required: true,
    },

    // For specific-room type
    bed: { type: bedSchema, required: true },

    numberOfRooms: {
        type: Number,
        required: function () {
            return this.type === ENTIRE_HOUSE
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

accommodationSchema.virtual("isAvailable")

module.exports = accommodationSchema
