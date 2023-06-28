const router = require("express").Router()

const { ADMIN, NORMAL_USER } = require("../configs/roles")
const { userController: controller } = require("../controllers")
const { userValidation: validation } = require("../validation")
const {
    validate,
    upload: { uploadImage },
    auth,
} = require("../middlewares")

router
    .route("/")
    .get(controller.getUsers)
    .post(auth([ADMIN]), validate(validation.createAUser), controller.createUser)
router
    .route("/:userId")
    .get(auth([ADMIN]), validate(validation.getUserById), controller.getUserById)

module.exports = router
