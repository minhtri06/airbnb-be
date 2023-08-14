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

    const chatIo = io.of("/chat")
    chatIo.use(authHandler)
    chatIo.on("connection", chatHandler(chatIo))
}

module.exports = initSocket
