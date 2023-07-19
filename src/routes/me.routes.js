const router = require("express").Router()

const {
    validate,
    auth,
    upload: { uploadImage },
} = require("../middlewares")
const { meController: controller } = require("../controllers")
const { meValidation: validation } = require("../validation")

router.use(auth())
router
    .route("/")
    .get(controller.getMyProfile)
    .patch(validate(validation.updateMyProfile), controller.updateMyProfile)

router.route("/avatars").put(uploadImage.single("avatar"), controller.replaceMyAvatar)

router.get(
    "/properties",
    validate(validation.getMyProperties),
    controller.getMyProperties,
)

router.post(
    "/saved-properties",
    validate(validation.saveProperty),
    controller.saveProperty,
)
router.delete(
    "/saved-properties/:propertyId",
    validate(validation.unSaveProperty),
    controller.unSaveProperty,
)

router.get("/bookings", validate(validation.getMyBookings), controller.getMyBookings)

module.exports = router
