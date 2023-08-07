const mongoose = require("mongoose")

const { addressSchema, accommodationSchema } = require("./subdocs")
const { toJSON, paginate } = require("./plugins")

const { Schema } = mongoose

const propertySchema = new Schema(
    {
        title: { type: String, trim: true, required: true },

        isClosed: { type: Boolean, default: false, required: true },

        owner: { type: Schema.Types.ObjectId, ref: "User", index: true, required: true },

        pageName: { type: String, unique: true, lowercase: true, required: true },

        categoryCodes: {
            type: [String],
            required: true,
            validate: function (categoryCodes) {
                if (categoryCodes.length === 0) {
                    throw new Error("Property must have at least one category codes")
                }
            },
        },

        score: { type: Number, min: 0, max: 10 },

        sumScore: { type: Number, min: 0, default: 0, required: true },

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

        description: { type: String },

        facilityCodes: { type: [String] },

        address: { type: addressSchema, default: () => ({}), required: true },

        thumbnail: { type: String },

        images: [String],

        accommodations: { type: [accommodationSchema], default: [], required: true },
    },

    {
        toJSON: {
            transform: function (doc, ret) {
                delete ret.caller
            },
        },
        timestamps: true,
        optimisticConcurrency: true,
    },
)

propertySchema.plugin(toJSON)
propertySchema.plugin(paginate)

propertySchema.virtual("isAvailable")
propertySchema.virtual("isSaved")

propertySchema.pre("validate", function (next) {
    const property = this
    if (
        !property.address ||
        isNaN(property.address.latitude) ||
        isNaN(property.address.longitude)
    ) {
        throw new Error("Longitude, latitude is required")
    }
    next()
})

const Property = mongoose.model("Property", propertySchema)

module.exports = Property
