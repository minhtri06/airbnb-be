const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt")
const GooglePlusTokenStrategy = require("passport-google-plus-token")
const createError = require("http-errors")

const {
    jwt: { SECRET },
    googleAuth: { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET },
} = require("./envConfig")
const { NORMAL_USER } = require("./roles")
const {
    tokenTypes: { ACCESS },
    authTypes: { GOOGLE },
} = require("../constants")
const { redisService, userService } = require("../services")

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
            const user = await redisService.findOrCacheFindUserById(payload.sub)
            if (!user) {
                throw createError.Unauthorized("Unauthorized")
            }
            return done(null, user)
        } catch (error) {
            done(error, false)
        }
    },
)

const googleStrategy = new GooglePlusTokenStrategy(
    {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, next) => {
        try {
            let user = await userService.findOneUser({ email: profile.emails[0].value })
            if (!user) {
                const body = {
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    authType: GOOGLE,
                    role: NORMAL_USER,
                }
                user = await userService.createUser(body)
            }
            return next(null, user)
        } catch (error) {
            return next(error, false)
        }
    },
)

module.exports = { jwtStrategy, googleStrategy }
