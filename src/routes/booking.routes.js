const router = require("express").Router()

const {
    validate,
    auth,
    bookingMiddleware: {
        getBookingById,
        requireToBeGuestOrPropertyOwner,
        requireToBePropertyOwner,
    },
} = require("../middlewares")
const { bookingController: controller } = require("../controllers")
const { bookingValidation: validation } = require("../validation")

router
    .route("/")
    .post(auth(), validate(validation.createBooking), controller.createBooking)

router.param("bookingId", getBookingById)

router.patch(
    "/:bookingId/cancel",
    auth(),
    validate(validation.cancelBooking),
    requireToBeGuestOrPropertyOwner,
    controller.cancelBooking,
)

router.patch(
    "/:bookingId/approve",
    auth(),
    validate(validation.approveBookingToAccom),
    requireToBePropertyOwner,
    controller.approveBookingToAccom,
)

module.exports = router
