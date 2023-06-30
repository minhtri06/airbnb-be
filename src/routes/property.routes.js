const router = require("express").Router()

const {
    validate,
    auth,
    upload: { uploadImage },
    propertyMiddleware: {
        getPropertyById,
        getPropertyByPageName,
        getAccomGroupById,
        requireToOwnProperty,
    },
} = require("../middlewares")
const { propertyValidation: validation } = require("../validation")
const { propertyController: controller } = require("../controllers")

router
    .route("/")
    .get(validate(validation.searchProperties), controller.searchProperties)
    .post(auth(), validate(validation.createProperty), controller.createProperty)

router.route("/my-properties").get(auth(), controller.getMyProperties)

router.get(
    "/page-name::pageName",
    validate(validation.getPropertyByPageName),
    getPropertyByPageName,
    controller.getProperty,
)

router.param("propertyId", getPropertyById)
router.param("accomGroupId", getAccomGroupById)

router
    .route("/:propertyId")
    .get(
        auth({ required: false }),
        validate(validation.getPropertyById),
        controller.getProperty,
    )
    .patch(
        auth(),
        requireToOwnProperty(),
        validate(validation.updateProperty),
        controller.updateProperty,
    )

router
    .route("/:propertyId/thumbnails")
    .put(
        uploadImage.single("thumbnail"),
        auth(),
        validate(validation.replaceThumbnail),
        requireToOwnProperty(),
        controller.replaceThumbnail,
    )

router
    .route("/:propertyId/images")
    .post(
        uploadImage.many("images"),
        auth(),
        requireToOwnProperty(),
        controller.addImages,
    )
    .delete(
        auth(),
        requireToOwnProperty(),
        validate(validation.deleteImages),
        controller.deleteImages,
    )

router
    .route("/:propertyId/accom-groups")
    .post(
        auth(),
        validate(validation.addAccommodationGroup),
        requireToOwnProperty(),
        controller.addAccommodationGroup,
    )

router
    .route("/:propertyId/accom-groups/:accomGroupId/accoms")
    .post(
        auth(),
        validate(validation.addAccommodations),
        requireToOwnProperty(),
        controller.addAccommodations,
    )

module.exports = router
