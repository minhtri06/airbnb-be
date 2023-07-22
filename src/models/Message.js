const mongoose = require("mongoose")

const { toJSON, paginate } = require("./plugins")

const { Schema } = mongoose

const messageSchema = new Schema({
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true, immutable: true },

    body: { type: String, required: true },

    conversation: {
        type: Schema.Types.ObjectId,
        ref: "Conversation",
        required: true,
        immutable: true,
    },

    isUnSend: { type: Boolean, default: false, required: true },
})

messageSchema.plugin(toJSON)
messageSchema.plugin(paginate)

messageSchema.index({ conversation: 1 })

const Message = mongoose.model("Message", messageSchema)

module.exports = Message
