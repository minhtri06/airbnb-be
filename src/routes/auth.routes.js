const router = require("express").Router()

const { authController: controller } = require("../controllers")
const { authValidation: validation } = require("../validation")
const { validate } = require("../middlewares")

router.post("/register", validate(validation.registerUser), controller.registerUser)

module.exports = router
