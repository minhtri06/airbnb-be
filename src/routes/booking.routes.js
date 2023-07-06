const router = require("express").Router()

const { validate, auth } = require("../middlewares")
const { bookingController: controller } = require("../controllers")
const { bookingValidation: validation } = require("../validation")

router
    .route("/my-bookings")
    .get(auth(), validate(validation.getMyBookings), controller.getMyBookings)

module.exports = router
