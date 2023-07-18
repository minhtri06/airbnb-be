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
    .post(
        auth({ allowedRoles: [ADMIN] }),
        validate(validation.createAUser),
        controller.createUser,
    )

router
    .route("/:userId")
    .get(
        auth({ allowedRoles: [ADMIN] }),
        validate(validation.getUserById),
        controller.getUserById,
    )
    .patch(
        auth({ allowedRoles: [ADMIN] }),
        validate(validation.updateUser),
        controller.updateUser,
    )

module.exports = router
