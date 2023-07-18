const router = require("express").Router()

const {
    validate,
    auth,
    upload: { uploadImage },
    propertyMiddleware: {
        getPropertyById,
        getPropertyByPageName,
        getAccommodationById,
        requireToBePropertyOwner,
    },
} = require("../middlewares")
const { propertyValidation: validation } = require("../validation")
const { propertyController: controller } = require("../controllers")

router
    .route("/")
    .get(validate(validation.searchProperties), controller.searchProperties)
    .post(auth(), validate(validation.createProperty), controller.createProperty)

router.get(
    "/page-name::pageName",
    validate(validation.getPropertyByPageName),
    getPropertyByPageName,
    controller.getProperty,
)

router.param("propertyId", getPropertyById)
router.param("accomId", getAccommodationById)

router
    .route("/:propertyId")
    .get(
        auth({ required: false }),
        validate(validation.getPropertyById),
        controller.getProperty,
    )
    .patch(
        auth(),
        requireToBePropertyOwner(),
        validate(validation.updateProperty),
        controller.updateProperty,
    )

router
    .route("/:propertyId/thumbnails")
    .put(
        uploadImage.single("thumbnail"),
        auth(),
        validate(validation.replaceThumbnail),
        requireToBePropertyOwner(),
        controller.replaceThumbnail,
    )

router
    .route("/:propertyId/images")
    .post(
        uploadImage.many("images"),
        auth(),
        requireToBePropertyOwner(),
        controller.addImages,
    )
    .delete(
        auth(),
        requireToBePropertyOwner(),
        validate(validation.deleteImages),
        controller.deleteImages,
    )

router.get(
    "/:propertyId/reviews",
    validate(validation.getPropertyReviews),
    controller.getPropertyReviews,
)

router
    .route("/:propertyId/accommodations")
    .post(
        auth(),
        validate(validation.addAccommodationGroup),
        requireToBePropertyOwner(),
        controller.addAccommodation,
    )

router
    .route("/:propertyId/accommodations/:accomId")
    .patch(
        auth(),
        validate(validation.updateAccomGroup),
        requireToBePropertyOwner(),
        controller.updateAccommodation,
    )
    .delete(
        auth(),
        validate(validation.deleteAccomGroup),
        requireToBePropertyOwner(),
        controller.deleteAccommodation,
    )

router
    .route("/:propertyId/accommodations/:accomId/bookings")
    .get(
        auth(),
        validate(validation.getAccommodationBookings),
        requireToBePropertyOwner(),
        controller.getAccommodationBookings,
    )

module.exports = router
