const router = require("express").Router()

const { authController: controller } = require("../controllers")
const { authValidation: validation } = require("../validation")
const { validate, auth } = require("../middlewares")

router.post("/register", validate(validation.registerUser), controller.registerUser)
router.post("/login", validate(validation.login), controller.login)
router.post("/logout", validate(validation.logout), controller.logout)
router.post("/refresh-token", validate(validation.refreshToken), controller.refreshToken)

module.exports = router
