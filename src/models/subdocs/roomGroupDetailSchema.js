const mongoose = require("mongoose")

const currentBookingDatesSchema = require("./currentBookingDatesSchema")
const { isArrayElementsUnique } = require("../../utils")

const { Schema } = mongoose

const roomGroupDetailSchema = new Schema({
    title: { type: String, required: true },
    pricePerNight: { type: Number, required: true, min: 0 },
    bedType: { type: String, required: true },
    rooms: {
        type: [
            {
                currentBookingDates: {
                    type: [currentBookingDatesSchema],
                    default: [],
                },
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

module.exports = roomGroupDetailSchema
