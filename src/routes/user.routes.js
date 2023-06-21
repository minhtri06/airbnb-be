const router = require("express").Router()

const { userController: controller } = require("../controllers")
const {
    validate,
    upload: { uploadImage },
} = require("../middlewares")

router.route("/").get(controller.getUsers).post(controller.createUser)

module.exports = router
