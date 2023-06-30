const mongoose = require("mongoose")

const { addressSchema, accommodationGroupSchema } = require("./subdocs")
const { toJSON } = require("./plugins")
const { ENTIRE_HOUSE, SPECIFIC_ROOM } = require("../constants").accommodationTypes

const { Schema } = mongoose

const removeBookingDateFields = (obj) => {
    for (let accomGroup of obj.accommodationGroups) {
        delete accomGroup.pendingBookingDates
        for (let accom of accomGroup.accommodations) {
            delete accom.currentBookingDates
        }
    }
}

const propertySchema = new Schema(
    {
        title: { type: String, required: true, trim: true },
        isClosed: { type: Boolean, default: false },
        owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        pageName: { type: String, required: true, unique: true, lowercase: true },
        score: { type: Number, min: 0, max: 10 },
        description: { type: String },
        facilities: { type: [String] },
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
        thumbnail: { type: String },
        images: [String],
        selectedQuestions: [
            {
                question: { type: String, required: true },
                answer: { type: String, required: true },
                questioner: { type: Schema.Types.ObjectId, ref: "User", required: true },
            },
        ],
        accommodationGroups: {
            type: [accommodationGroupSchema],
            validate(accomGroups) {
                if (this.isModified("accommodationGroups")) {
                    for (let accomGroup of accomGroups) {
                        if (!accomGroup) {
                            throw new Error(
                                "accommodationGroup can not be null or undefined",
                            )
                        }
                    }
                }
            },
        },
    },
    {
        toJSON: {
            transform: function (doc, ret) {
                if (!doc.caller.isOwner) {
                    removeBookingDateFields(ret)
                }
            },
        },
    },
)

propertySchema.plugin(toJSON)

propertySchema.virtual("isAvailable")
propertySchema.virtual("caller.isOwner")

propertySchema.statics.removeBookingDateFields = removeBookingDateFields

const Property = mongoose.model("Property", propertySchema)

module.exports = Property
