const mongoose = require("mongoose")

const currentBookingDatesSchema = require("./currentBookingDatesSchema")
const { isArrayElementsUnique } = require("../../utils")

const { Schema } = mongoose

const houseDetailSchema = new Schema({
    title: { type: String, required: true, trim: true },
    pricePerNight: { type: Number, required: true, min: 0 },
    currentBookDates: { type: [currentBookingDatesSchema], default: [] },
    rooms: {
        type: [
            {
                roomType: { type: String, required: true },
                bedType: { type: String, required: true },
                roomCode: { type: String, required: true },
            },
        ],
        validate: function (rooms) {
            if (rooms.length < 1) {
                throw new Error("Must have at least one room")
            }
            if (!isArrayElementsUnique(rooms.map((room) => room.roomCode))) {
                throw new Error("Room codes must be unique")
            }
        },
    },
})

module.exports = houseDetailSchema
