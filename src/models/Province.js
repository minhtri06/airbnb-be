const mongoose = require("mongoose")
const { toJSON } = require("./plugins")

const { Schema } = mongoose

const provinceSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        divisionType: { type: String, required: true, trim: true },
        code: { type: Number, required: true, unique: true },
    },
    { timestamps: true },
)

provinceSchema.plugin(toJSON)

const Province = mongoose.model("Province", provinceSchema)

module.exports = Province
