const mongoose = require("mongoose")

const { toJSON, paginate } = require("./plugins")

const { Schema } = mongoose

const messageSchema = new Schema(
    {
        users: {
            type: [{ type: Schema.Types.ObjectId, ref: "User" }],
            immutable: true,
            validate() {
                if (this.users.length !== 2) throw new Error("Invalid users in Message")
            },
        },

        body: { type: String, required: true },
    },

    {
        timestamps: true,
    },
)

messageSchema.plugin(toJSON)
messageSchema.plugin(paginate)

messageSchema.index({ users: 1 })

const Message = mongoose.model("Message", messageSchema)

module.exports = Message
