const mongoose = require("mongoose")

const { toJSON, paginate } = require("./plugins")

const { Schema } = mongoose

const conversationSchema = new Schema({
    users: {
        type: [{ type: Schema.Types.ObjectId, ref: "User" }],
        validate: function (users) {
            if (users.length) {
                throw new Error("users cannot empty")
            }
        },
        immutable: true,
    },

    latestMessage: {
        body: { type: String, required: true, immutable: true },

        sender: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            immutable: true,
        },
    },
})

conversationSchema.plugin(toJSON)
conversationSchema.plugin(paginate)

conversationSchema.index({ users: 1 })

const Conversation = mongoose.model("Conversation", conversationSchema)

module.exports = Conversation
