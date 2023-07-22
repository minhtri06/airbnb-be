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
    const { token } = socket.handshake.auth
    if (!token) {
        return next(new Error("No token"))
    }

    token = token.split(" ")[1]

    const payload = tokenService.getPayload(token)
    if (!payload || payload.type !== ACCESS) {
        return next(new Error("Invalid token"))
    }
    if (payload.isExpired) {
        return next(new Error("Token expired"))
    }

    const user = await redisService.findOrCacheFindUserById(payload.sub)
    if (!user) {
        throw createError.Unauthorized("Unauthorized")
    }
    socket.user = user
    await redisService.cacheUserSocket(user._id, socket.id)

    next()
}

module.exports = authHandler
