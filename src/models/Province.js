const mongoose = require("mongoose")
const { toJSON, paginate } = require("./plugins")

const { Schema } = mongoose

const provinceSchema = new Schema(
    {
        name: { type: String, trim: true, required: true },

        divisionType: { type: String, trim: true, required: true },

        code: { type: Number, unique: true, required: true },
    },

    { timestamps: true, optimisticConcurrency: true },
)

provinceSchema.plugin(toJSON)
provinceSchema.plugin(paginate)

const Province = mongoose.model("Province", provinceSchema)

module.exports = Province
