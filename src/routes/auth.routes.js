const router = require("express").Router()

const { authController: controller } = require("../controllers")
const { authValidation: validation } = require("../validation")
const {
    generalMiddlewares: { validate },
} = require("../middlewares")

router.post("/register", validate(validation.registerUser), controller.registerUser)
router.post("/login", validate(validation.localLogin), controller.localLogin)
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

module.exports = router
