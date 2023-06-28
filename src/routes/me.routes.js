const router = require("express").Router()

const { validate, auth } = require("../middlewares")
const { meController: controller } = require("../controllers")
const { meValidation: validation } = require("../validation")

router.use(auth())
router
    .route("/")
    .get(controller.getMyProfile)
    .patch(validate(validation.updateMyProfile), controller.updateMyProfile)

module.exports = router
