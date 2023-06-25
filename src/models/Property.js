const mongoose = require("mongoose")

const { addressSchema, currentBookingDatesSchema } = require("./subdocs")
const { toJSON } = require("./plugins")
const { ENTIRE_HOUSE, SPECIFIC_ROOM } = require("../constants").propertyType

const { Schema } = mongoose

const propertySchema = new Schema({
    title: { type: String, required: true, trim: true },
    isClosed: { type: Boolean, default: false },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    pageUrl: { type: String, required: true, unique: true, lowercase: true },
    score: { type: Number, min: 0, max: 10 },
    reviewCount: {
        type: Number,
        get: function (value) {
            return Math.round(value)
        },
        set: function (value) {
            return Math.round(value)
        },
        default: 0,
        min: 0,
        required: true,
    },
    address: {
        type: addressSchema,
        default: () => ({}),
        required: true,
    },
    thumbnail: String,
    images: [String],
    selectedQuestions: [
        {
            question: { type: String, required: true },
            answer: { type: String, required: true },
            questioner: { type: Schema.Types.ObjectId, ref: "User", required: true },
        },
    ],
    propertyType: { type: String, required: true, enum: [ENTIRE_HOUSE, SPECIFIC_ROOM] },
    houseDetail: {
        type: {
            title: { type: String, required: true, trim: true },
            rooms: [
                {
                    roomType: { type: String, required: true },
                    bedType: { type: String, required: true },
                    roomCode: { type: String, required: true },
                },
            ],
            pricePerNight: { type: Number, required: true, min: 0 },
            currentBookDates: { type: [currentBookingDatesSchema], default: [] },
        },
        required: function () {
            return this.get("propertyType") === ENTIRE_HOUSE
        },
    },
    roomDetail: {
        type: {
            title: { type: String, required: true },
            pricePerNight: { type: Number, required: true, min: 0 },
            bedType: { type: String, required: true },
            rooms: [
                {
                    currentBookingDates: {
                        type: [currentBookingDatesSchema],
                        default: [],
                    },
                    roomCode: { type: String, required: true },
                },
            ],
        },
        required: function () {
            return this.get("propertyType") === SPECIFIC_ROOM
        },
    },
})

propertySchema.plugin(toJSON)

propertySchema.pre("save", function (next) {
    const property = this
    if (property.propertyType === ENTIRE_HOUSE) {
        property.roomDetail = undefined
    }
    if (property.propertyType === SPECIFIC_ROOM) {
        property.houseDetail = undefined
    }
    next()
})

const Property = mongoose.model("Property", propertySchema)

module.exports = Property
