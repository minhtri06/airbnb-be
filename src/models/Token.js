const mongoose = require("mongoose")

const { toJSON } = require("./plugins")
const { tokenTypes } = require("../constants")

const { Schema } = mongoose

const tokenSchema = new Schema(
    {
        body: { type: String, index: true, required: true },

        user: { type: Schema.Types.ObjectId, ref: "User", required: true },

        type: { type: String, enum: Object.values(tokenTypes), required: true },

        expires: { type: Date, required: true },

        isRevoked: { type: Boolean },

        isUsed: { type: Boolean },

        isBlacklisted: { type: Boolean },
    },
    { timestamps: true, optimisticConcurrency: true },
)

tokenSchema.plugin(toJSON)

const Token = mongoose.model("Token", tokenSchema)

module.exports = Token
