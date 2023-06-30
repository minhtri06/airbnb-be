const mongoose = require("mongoose")

const { Schema } = mongoose

const bookingDatesSchema = new Schema({
    bookIn: { type: Date, required: true },
    bookOut: { type: Date, required: true },
    guest: { type: Schema.Types.ObjectId, ref: "User", required: true },
})

bookingDatesSchema.pre("save", function () {
    if (this.bookIn > this.bookOut) {
        const err = new mongoose.Error.ValidationError()
        err.message = "Book in date must be before book out date"
        throw err
    }
})

module.exports = bookingDatesSchema
