const router = require("express").Router()

const { auth, validate } = require("../middlewares")
const { reviewController: controller } = require("../controllers")
const { reviewValidation: validation } = require("../validation")

router.route("/").post(auth(), validate(validation.addReview), controller.addReview)

module.exports = router
