const mongoose = require("mongoose")
const createError = require("http-errors")

const District = require("../District")
const Province = require("../Province")

const { Schema } = mongoose
const { Error } = mongoose

const addressSchema = new Schema({
    address: { type: String, required: true },
    district: { type: Schema.Types.ObjectId, ref: "District", required: true },
    districtName: { type: String },
    province: { type: Schema.Types.ObjectId, ref: "Province", required: true },
    provinceName: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
})

addressSchema.pre("save", async function (next) {
    const address = this
    if (
        address.isModified("address.district") ||
        address.isModified("address.province")
    ) {
        const district = await District.findById(address.district)
        const province = await Province.findById(address.province)
        if (!district) {
            throw createError.NotFound("District not found")
        }
        if (!province) {
            throw createError.NotFound("Province not found")
        }
        if (!district.province.equals(province._id)) {
            const err = new Error.ValidationError()
            err.message = "District and province do not match"
            throw err
        }
        address.districtName = district.name
        address.provinceName = province.name
    }
    next()
})

module.exports = addressSchema
