const mongoose = require("mongoose")

const { Schema } = mongoose

const currentBookingDatesSchema = new Schema({
    bookIn: { type: Date, required: true },
    bookOut: { type: Date, required: true },
})

currentBookingDatesSchema.pre("save", function () {
    if (this.bookIn > this.bookOut) {
        const err = new mongoose.Error.ValidationError()
        err.message = "Book in date must be before book out date"
        throw err
    }
})

module.exports = currentBookingDatesSchema
