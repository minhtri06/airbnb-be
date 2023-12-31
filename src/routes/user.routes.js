const router = require("express").Router()

const { ADMIN, NORMAL_USER } = require("../configs/roles")
const { userController: controller } = require("../controllers")
const { userValidation: validation } = require("../validation")
const {
    generalMiddlewares: { validate, auth },
} = require("../middlewares")

router
    .route("/")
    .post(
        auth({ allowedRoles: [ADMIN] }),
        validate(validation.createAUser),
        controller.createUser,
    )

router.get("/:userId", validate(validation.getUserById), controller.getUserById)

module.exports = router
