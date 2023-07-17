const passport = require("passport")
const createError = require("http-errors")

/**
 * @param {string[] | undefined} allowedRoles
 * @param {boolean} required
 * @param {Object} req
 * @param {function()} next
 */
const verifyCallBack = (allowedRoles, required, req, next) => async (err, user, info) => {
    try {
        if (!required) {
            req.user = undefined
            return next()
        }

        if (err) {
            throw err
        }
        if (!user || info) {
            throw createError.Unauthorized("Unauthorized")
        }

        req.user = user

        if (allowedRoles) {
            if (!allowedRoles.includes(user.role)) {
                throw createError.Forbidden("Forbidden")
            }
        }
        return next()
    } catch (error) {
        return next(error)
    }
}

/**
 * Returns a middleware that check authentication & authorization
 * @param {Object} options
 * allowed roles. If undefined => allows all roles. Only work if required = true.
 * @param {string[] | undefined} options.allowedRoles
 * @param {boolean | undefined} options.required Require authentication or not.
 * @returns {import('express').RequestHandler}
 */
const auth = ({ allowedRoles, required } = {}) => {
    required = required !== undefined ? required : true
    allowedRoles = allowedRoles

    return async (req, res, next) => {
        passport.authenticate(
            "jwt",
            { session: false },
            verifyCallBack(allowedRoles, required, req, next),
        )(req, res, next)
    }
}

module.exports = auth
