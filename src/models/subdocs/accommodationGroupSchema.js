const mongoose = require("mongoose")

const {
    accommodationGroupTypes: { ENTIRE_HOUSE, SPECIFIC_ROOM },
} = require("../../constants")
const currentBookingDatesSchema = require("./currentBookingDatesSchema")

const { Schema } = mongoose

const accommodationGroupSchema = new Schema({
    title: { type: String, trim: true, required: true },
    pricePerNight: { type: Number, min: 0, required: true },
    type: {
        type: String,
        enum: [ENTIRE_HOUSE, SPECIFIC_ROOM],
        required: true,
    },

    // Just for specific-room accommodation
    bedType: {
        type: String,
        required() {
            return this.get("type") === SPECIFIC_ROOM
        },
    },

    accommodations: {
        type: [
            {
                currentBookingDates: [currentBookingDatesSchema],

                roomCode: String,

                // Just for entire-house accommodation
                rooms: {
                    type: [
                        {
                            bedType: { type: String, required: true },
                            roomType: { type: String, required: true },
                        },
                    ],
                },
            },
        ],
        validate(accommodations) {
            if (!this.isModified("accommodations")) {
                return
            }

            if (accommodations.length < 1) {
                throw new Error("Must have at least one accommodation")
            }

            if (this.get("type") === ENTIRE_HOUSE) {
                if (accommodations.length !== 1) {
                    throw new Error(
                        `${ENTIRE_HOUSE} accommodation group must have exact one accommodation`,
                    )
                }
                if (accommodations[0].rooms.length === 0) {
                    throw new Error(
                        `rooms property is required in ${ENTIRE_HOUSE} accommodation`,
                    )
                }
                this.bedType = undefined
            }

            if (this.get("type") === SPECIFIC_ROOM) {
                for (let accommodation of accommodations) {
                    if (!accommodation.roomCode) {
                        throw new Error(
                            `roomCode is required in ${SPECIFIC_ROOM} accommodation`,
                        )
                    }
                    if (accommodation.rooms?.length) {
                        throw new Error(
                            `${SPECIFIC_ROOM} accommodation cannot have rooms property`,
                        )
                    }
                    accommodation.rooms = undefined
                }
            }
        },
    },
})

module.exports = accommodationGroupSchema
