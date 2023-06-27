const router = require("express").Router()

const { validate, auth } = require("../middlewares")
const { meController: controller } = require("../controllers")

router.use(auth())
router.route("/").get(controller.getMyProfile)

module.exports = router
