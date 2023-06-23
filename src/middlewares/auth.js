const passport = require("passport")
const createError = require("http-errors")

/**
 *
 * @param {string[]} allowedRoles
 * @param {object} req
 * @param {function} next
 * @returns {function}
 */
const verifyCallBack = (allowedRoles, required, req, next) => async (err, user, info) => {
    try {
        if (!required) {
            next()
        }

        if (err || !user || info) {
            throw createError.Unauthorized("Unauthorized")
        }

        req.user = user

        if (allowedRoles.length !== 0) {
            // if every roles of user is not included in allowedRoles => throw Forbidden error
            if (user.roles.every((role) => !allowedRoles.includes(role))) {
                throw createError.Forbidden("Forbidden")
            }
        }
        next()
    } catch (error) {
        next(error)
    }
}

const auth =
    (allowedRoles, required = true) =>
    async (req, res, next) => {
        passport.authenticate(
            "jwt",
            { session: false },
            verifyCallBack(allowedRoles, required, req, next),
        )(req, res, next)
    }

module.exports = auth
