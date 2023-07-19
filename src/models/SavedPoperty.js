const mongoose = require("mongoose")

const { Schema } = mongoose

const savedPropertySchema = new Schema({
    _id: false,

    user: { type: Schema.Types.ObjectId, ref: "User", required: true },

    property: { type: Schema.Types.ObjectId, ref: "Property", required: true },
})

savedPropertySchema.index({ user: 1, property: 1 }, { unique: true })

const SavedProperty = mongoose.model("SavedProperty", savedPropertySchema)

module.exports = SavedProperty
