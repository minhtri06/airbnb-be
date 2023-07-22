const { redisService } = require("../services")

/**
 *
 * @param {import('socket.io').Server} io
 * @param {import('socket.io').Socket & { user }} socket
 */
const chatHandler = (io, socket) => {
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
