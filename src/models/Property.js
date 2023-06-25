const mongoose = require("mongoose")

const { addressSchema, houseDetailSchema, roomGroupDetailSchema } = require("./subdocs")
const { toJSON } = require("./plugins")
const { ENTIRE_HOUSE, SPECIFIC_ROOM } = require("../constants").propertyType
const { createMongooseValidationErr } = require("../utils")

const { Schema } = mongoose

const propertySchema = new Schema({
    title: { type: String, required: true, trim: true },
    isClosed: { type: Boolean, default: false },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    pageName: { type: String, required: true, unique: true, lowercase: true },
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
        type: houseDetailSchema,
        required: function () {
            return this.get("propertyType") === ENTIRE_HOUSE
        },
    },
    roomGroupDetails: {
        type: [roomGroupDetailSchema],
        validate(roomGroupDetails) {
            if (!Array.isArray(roomGroupDetails)) {
                throw Error("roomGroupDetails must be an array")
            }
            if (
                this.get("propertyType") === SPECIFIC_ROOM &&
                roomGroupDetails.length < 1
            ) {
                throw Error(
                    "roomGroupDetails is required and must have at least one room group",
                )
            }
        },
    },
})

propertySchema.plugin(toJSON)

propertySchema.pre("save", function (next) {
    const property = this
    if (property.propertyType === ENTIRE_HOUSE) {
        property.roomGroupDetails = undefined
    }
    if (property.propertyType === SPECIFIC_ROOM) {
        property.houseDetail = undefined
    }
    next()
})

const Property = mongoose.model("Property", propertySchema)

module.exports = Property
