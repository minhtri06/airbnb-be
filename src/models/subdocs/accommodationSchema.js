const mongoose = require("mongoose")

const bookingDatesSchema = require("./bookingDatesSchema")

const { Schema } = mongoose

const accommodationSchema = new Schema({
    currentBookingDates: [bookingDatesSchema],

    // Just for specific-room accommodation
    roomCode: { type: String },

    // Just for entire-house accommodation
    rooms: {
        type: [
            {
                bedType: { type: String, required: true },
                roomType: { type: String, required: true },
            },
        ],
    },
})

accommodationSchema.virtual("isAvailable")

module.exports = accommodationSchema
