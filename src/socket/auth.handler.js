const moment = require("moment")

const { tokenService, redisService } = require("../services")
const {
    tokenTypes: { ACCESS },
} = require("../constants")

/**
 *
 * @param {import('socket.io').Socket} socket
 * @param {function} next
 * @returns
 */
const authHandler = async (socket, next) => {
    // console.log("socket id", socket.id)
    // let { token } = socket.handshake.auth
    // if (!token) {
    //     return next(new Error("No token"))
    // }

    // token = token.split(" ")[1]

    // const payload = tokenService.verifyToken(token, ACCESS, {})

    try {
        let { accessToken } = socket.handshake.auth
        accessToken = accessToken.split(" ")[1]
        const payload = tokenService.verifyToken(accessToken, ACCESS)

        const user = await redisService.findOrCacheFindUserById(payload.sub)
        if (!user) next(createError.Unauthorized("Unauthorized"))

        socket.user = user
        await redisService.cacheUserSocketId(user._id, socket.id)
        console.log("connect:", user._id.toString())
        next()
    } catch (error) {
        next(error)
    }
}

module.exports = authHandler
