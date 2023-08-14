const mongoose = require("mongoose")

const { toJSON, paginate } = require("./plugins")

const { Schema } = mongoose

const conversationSchema = new Schema(
    {
        users: {
            type: [{ type: Schema.Types.ObjectId, ref: "User" }],
            validate: function (users) {
                if (users.length === 0) {
                    throw new Error("users cannot empty")
                }
            },
            immutable: true,
        },

        withUser: { type: Schema.Types.ObjectId, ref: "User" },

        latestMessage: {
            body: { type: String },

            sender: { type: Schema.Types.ObjectId, ref: "User" },
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform(doc, ret) {
                delete ret.users
            },
        },
    },
)

conversationSchema.pre("save", function (next) {
    this.withUser = undefined
    next()
})

conversationSchema.plugin(toJSON)
conversationSchema.plugin(paginate)

conversationSchema.index({ users: 1 })

const Conversation = mongoose.model("Conversation", conversationSchema)

module.exports = Conversation
