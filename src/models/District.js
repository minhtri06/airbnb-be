const mongoose = require("mongoose")
const { toJSON } = require("./plugins")

const { Schema } = mongoose

const districtSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        divisionType: { type: String, required: true, trim: true },
        code: { type: Number, required: true, unique: true },
        provinceCode: { type: Number, required: true, index: true },
        province: { type: Schema.Types.ObjectId, ref: "Province", required: true },
    },
    { timestamps: true },
)

districtSchema.plugin(toJSON)

const District = mongoose.model("District", districtSchema)

module.exports = District
