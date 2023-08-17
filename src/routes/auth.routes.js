const router = require("express").Router()
const passport = require("passport")

const { authController: controller } = require("../controllers")
const { authValidation: validation } = require("../validation")
const {
    generalMiddlewares: { validate, auth },
} = require("../middlewares")

router.post("/register", validate(validation.registerUser), controller.registerUser)
router.post("/login", validate(validation.localLogin), controller.localLogin)
router.post("/google-login", validate(validation.googleLogin), controller.googleLogin)
router.post("/logout", validate(validation.logout), controller.logout)
router.post("/refresh-token", validate(validation.refreshToken), controller.refreshToken)
router.post("/verify-email", validate(validation.verifyEmail), controller.verifyEmail)
router.post(
    "/forgot-password",
    validate(validation.forgotPassword),
    controller.forgotPassword,
)
router.post(
    "/reset-password",
    validate(validation.resetPassword),
    controller.resetPassword,
)
router.post(
    "/change-password",
    auth(),
    validate(validation.changePassword),
    controller.changePassword,
)

module.exports = router
