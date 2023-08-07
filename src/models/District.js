const mongoose = require("mongoose")
const { toJSON, paginate } = require("./plugins")

const { Schema } = mongoose

const districtSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },

        divisionType: { type: String, required: true, trim: true },

        code: { type: Number, required: true, unique: true },

        provinceCode: { type: Number, required: true, index: true },

        province: { type: Schema.Types.ObjectId, ref: "Province", required: true },

        latitude: { type: Number, required: true },

        longitude: { type: Number, required: true },
    },

    { timestamps: true, optimisticConcurrency: true },
)

districtSchema.plugin(toJSON)
districtSchema.plugin(paginate)

const District = mongoose.model("District", districtSchema)

module.exports = District
