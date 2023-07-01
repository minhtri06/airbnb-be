const mongoose = require("mongoose")
const { toJSON } = require("./plugins")

const { Schema } = mongoose

const refreshTokenSchema = new Schema(
    {
        body: { type: String, index: true, required: true },
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        accessToken: { type: String, required: true, trim: true },
        expires: { type: Date, required: true },
        isRevoked: { type: Boolean, default: false, required: true },
        isUsed: { type: Boolean, default: false, required: true },
        isBlacklisted: { type: Boolean, default: false, required: true },
    },
    { timestamps: true },
)

refreshTokenSchema.plugin(toJSON)

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema)

module.exports = RefreshToken
