const passport = require("passport")
const createError = require("http-errors")

/**
 *
 * @param {string[] | false} require
 * @param {object} req
 * @param {function} next
 * @returns {function}
 */
const verifyCallBack = (requireRole, required, req, next) => async (err, user, info) => {
    try {
        if (!required) {
            req.user = user
            return next()
        }
        if (err) {
            throw err
        }
        if (!user || info) {
            throw createError.Unauthorized("Unauthorized")
        }

        req.user = user

        if (requireRole.length !== 0) {
            // if every roles of user is not included in requireRole => throw Forbidden error
            if (user.roles.every((role) => !requireRole.includes(role))) {
                throw createError.Forbidden("Forbidden")
            }
        }
        return next()
    } catch (error) {
        next(error)
    }
}

/**
 * Check authentication & authorization
 * @param {{requireRole, required}} options
 * @param {string[]} options.requireRole Allowed roles. Only work if required = true
 * @param {boolean} options.required Require authentication or not.
 * @returns
 */
const auth = ({ requireRole, required } = {}) => {
    required = required !== undefined ? required : true
    requireRole = requireRole || []

    return async (req, res, next) => {
        passport.authenticate(
            "jwt",
            { session: false },
            verifyCallBack(requireRole, required, req, next),
        )(req, res, next)
    }
}

module.exports = auth
