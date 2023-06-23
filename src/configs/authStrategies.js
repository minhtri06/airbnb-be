const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt")
const createError = require("http-errors")

const { SECRET } = require("./envConfig").jwt
const { ACCESS } = require("../constants").tokenTypes
const { redisService } = require("../services")

const jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken("Authorization")

const jwtStrategy = new JwtStrategy(
    {
        secretOrKey: SECRET,
        jwtFromRequest,
    },
    async (payload, done) => {
        try {
            if (payload.type !== ACCESS) {
                throw createError.BadRequest("Invalid token type")
            }
            const user = await redisService.getOrCacheGetUser(payload.sub)
            if (!user) {
                throw createError.Unauthorized("Unauthorized")
            }
            return done(null, user)
        } catch (error) {
            done(error, false)
        }
    },
)

module.exports = { jwtStrategy }
