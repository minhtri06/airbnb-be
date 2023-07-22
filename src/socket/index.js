const { Server } = require("socket.io")

const envConfig = require("../configs/envConfig")
const authHandler = require("./auth.handler")
const chatHandler = require("./chat.handler")

const initSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: envConfig.CLIENT_URL,
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        },
    })

    io.use(authHandler)

    io.of("/chat").on("connection", (socket) => {
        chatHandler(io, socket)
    })
}

module.exports = initSocket
