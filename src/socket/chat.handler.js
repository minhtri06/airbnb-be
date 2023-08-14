const { redisService, chatService } = require("../services")

/**
 * Handle chat socket
 * @param {import('socket.io').Server} io
 * @returns {function(socket)}
 */
const chatHandler = (io) => async (socket) => {
    socket.on("clg-user", () => {
        console.log(socket.user)
    })
    socket.on("ping", () => console.log("yolo"))
    socket.on("send-message", async ({ receiverId, body }) => {
        const receiveSocketId = await redisService.findUserSocketId(receiverId)
        io.to(receiveSocketId).emit("receive-message", {
            senderId: socket.user._id,
            body,
        })
    })

    socket.on("disconnect", async () => {
        // await redisService.deleteUserSocketId(socket.user._id)
    })
}

module.exports = chatHandler

/**
 * @typedef {InstanceType<import('../models/User')>} user
 * @typedef {import('socket.io').Socket & { user: user }} socket
 */
