const mongoose = require("mongoose")

const { addressSchema, accommodationGroupSchema } = require("./subdocs")
const { toJSON, paginate } = require("./plugins")
const { ENTIRE_HOUSE, SPECIFIC_ROOM } = require("../constants").accommodationTypes

const { Schema } = mongoose

const removeBookingDateFields = (obj) => {
    if (!obj.accommodationGroups) {
        return
    }
    for (let accomGroup of obj.accommodationGroups || []) {
        for (let accom of accomGroup.accommodations || []) {
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
        accommodationGroups: {
            type: [accommodationGroupSchema],
            validate(accomGroups) {
                if (this.isModified("accommodationGroups")) {
                    for (let accomGroup of accomGroups || []) {
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
                removeBookingDateFields(ret)
                delete ret.caller
            },
        },
        timestamps: true,
    },
)

propertySchema.index({
    _id: 1,
    "accommodationGroups._id": 1,
    "accommodationGroups.accommodations._id": 1,
})

propertySchema.plugin(toJSON)
propertySchema.plugin(paginate)

propertySchema.virtual("isAvailable")
propertySchema.virtual("caller.isOwner")

propertySchema.statics.removeBookingDateFields = removeBookingDateFields

// Add current booking dates to accom so that bookIn is increasing
propertySchema.statics.addCurrentBookingDateToAccom = function (
    propertyId,
    accomGroupId,
    accomId,
    newCBDate,
) {
    const updateQuery = Property.updateOne(
        { _id: propertyId },
        {
            $push: {
                "accommodationGroups.$[i].accommodations.$[j].currentBookingDates": {
                    $each: [newCBDate],
                    $sort: { bookIn: 1 },
                },
            },
        },
        { arrayFilters: [{ "i._id": accomGroupId }, { "j._id": accomId }] },
    )
    return updateQuery
}

propertySchema.statics.removeCurrentBookingDateFromAccom = function (
    propertyId,
    accomGroupId,
    accomId,
    removedCBDateId,
) {
    const updateQuery = Property.updateOne(
        { _id: propertyId },
        {
            $pull: {
                "accommodationGroups.$[i].accommodations.$[j].currentBookingDates": {
                    _id: removedCBDateId,
                },
            },
        },
        { arrayFilters: [{ "i._id": accomGroupId }, { "j._id": accomId }] },
    )
    return updateQuery
}

propertySchema.statics.getPropertyAndAccomGroup = async function (
    propertyId,
    accomGroupId,
) {
    const property = await Property.findById(propertyId)
    const accomGroup = property ? property.accommodationGroups.id(accomGroupId) : null
    return { property, accomGroup }
}

propertySchema.statics.getPropertyAccomGroupAndAccom = async function (
    propertyId,
    accomGroupId,
    accomId,
) {
    const { property, accomGroup } = await Property.getPropertyAndAccomGroup(
        propertyId,
        accomGroupId,
    )
    const accom = accomGroup ? accomGroup.accommodations.id(accomId) : null
    return { property, accomGroup, accom }
}

const Property = mongoose.model("Property", propertySchema)

module.exports = Property
