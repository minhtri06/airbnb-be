const router = require("express").Router()

const {
    generalMiddlewares: {
        validate,
        auth,
        upload: { uploadImage },
    },
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
    .get(
        auth({ required: false }),
        validate(validation.searchProperties),
        controller.searchProperties,
    )
    .post(auth(), validate(validation.createProperty), controller.createProperty)

router.get(
    "/page-name::pageName",
    auth({ required: false }),
    validate(validation.getPropertyByPageName),
    getPropertyByPageName,
    controller.getProperty,
)

router.post(
    "/check-page-name-exits",
    validate(validation.checkPageNameExists),
    controller.checkPageNameExists,
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
        requireToBePropertyOwner({ allowAdmin: true }),
        validate(validation.updateProperty),
        controller.updateProperty,
    )

router.put(
    "/:propertyId/thumbnail",
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
    .route("/:propertyId/accommodations")
    .post(
        auth(),
        validate(validation.addAccommodation),
        requireToBePropertyOwner(),
        controller.addAccommodation,
    )

router
    .route("/:propertyId/accommodations/:accomId")
    .patch(
        auth(),
        validate(validation.updateAccommodation),
        requireToBePropertyOwner(),
        controller.updateAccommodation,
    )
    .delete(
        auth(),
        validate(validation.deleteAccommodation),
        requireToBePropertyOwner({ allowAdmin: true }),
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
