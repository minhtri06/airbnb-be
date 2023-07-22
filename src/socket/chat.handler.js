const { redisService, chatService } = require("../services")

/**
 * Handle chat socket
 * @param {import('socket.io').Server} io
 * @returns {function(socket)}
 */
const chatHandler = (io) => async (socket) => {
    const conversations = await chatService.findConversations({ users: socket.user._id })
    for (let convo of conversations) {
        socket.join(convo._id)
    }

    socket.on("make-conversation", async ({ conversationId, withUserId }) => {
        const withSocketId = await redisService.findUserSocketId(withUserId)
        if (!withSocketId) {
            return
        }

        const withSocket = io.sockets.sockets.get(withSocketId)
        if (!withSocket) {
            return
        }

        withSocket.join(conversationId)
        socket.join(conversationId)
    })

    socket.on("send-message", async ({ conversationId, body }) => {
        io.to(conversationId).emit("receive-message", {
            sender: socket.user._id,
            conversationId,
            body,
        })
    })

    socket.on("disconnect", async () => {
        await redisService.deleteUserSocketId(socket.user._id)
    })
}

module.exports = chatHandler

/**
 * @typedef {InstanceType<import('../models/User')>} user
 * @typedef {import('socket.io').Socket & { user: user }} socket
 */
