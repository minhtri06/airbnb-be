const router = require("express").Router()

const {
    validate,
    auth,
    bookingMiddleware: { getBookingById, requireToBeBookingGuestOrPropOwner },
} = require("../middlewares")
const { bookingController: controller } = require("../controllers")
const { bookingValidation: validation } = require("../validation")

router
    .route("/")
    .post(auth(), validate(validation.createBooking), controller.createBooking)

router.param("bookingId", getBookingById)

router
    .route("/:bookingId/cancel")
    .patch(
        auth(),
        validate(validation.cancelBooking),
        requireToBeBookingGuestOrPropOwner,
        controller.cancelBooking,
    )

router
    .route("/my-bookings")
    .get(auth(), validate(validation.getMyBookings), controller.getMyBookings)

module.exports = router
