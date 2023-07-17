const router = require("express").Router()

const {
    validate,
    auth,
    upload: { uploadImage },
    propertyMiddleware: {
        getPropertyById,
        getPropertyByPageName,
        getAccomGroupById,
        getAccomById,
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
router.param("accomGroupId", getAccomGroupById)
router.param("accomId", getAccomById)

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

router
    .route("/:propertyId/accom-groups")
    .post(
        auth(),
        validate(validation.addAccommodationGroup),
        requireToBePropertyOwner(),
        controller.addAccommodationGroup,
    )

router.get(
    "/:propertyId/pending-bookings",
    auth(),
    validate(validation.getPropertyPendingBookings),
    requireToBePropertyOwner(),
    controller.getPropertyPendingBookings,
)

router
    .route("/:propertyId/accom-groups/:accomGroupId")
    .patch(
        auth(),
        validate(validation.updateAccomGroup),
        requireToBePropertyOwner(),
        controller.updateAccomGroup,
    )
    .delete(
        auth(),
        validate(validation.deleteAccomGroup),
        requireToBePropertyOwner(),
        controller.deleteAccomGroup,
    )

router
    .route("/:propertyId/accom-groups/:accomGroupId/accoms")
    .post(
        auth(),
        validate(validation.addAccommodations),
        requireToBePropertyOwner(),
        controller.addAccommodations,
    )

router
    .route("/:propertyId/accom-groups/:accomGroupId/accoms/:accomId")
    .delete(
        auth(),
        validate(validation.deleteAccom),
        requireToBePropertyOwner(),
        controller.deleteAccom,
    )

router
    .route("/:propertyId/accom-groups/:accomGroupId/accoms/:accomId/bookings")
    .get(
        auth(),
        validate(validation.getAccommodationBookings),
        requireToBePropertyOwner(),
        controller.getAccommodationBookings,
    )

router.get(
    "/:propertyId/reviews",
    validate(validation.getPropertyReviews),
    controller.getPropertyReviews,
)

module.exports = router
