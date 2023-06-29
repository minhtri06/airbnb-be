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
    getPropertyByPageName(),
    controller.getProperty,
)

router
    .route("/:propertyId")
    .get(validate(validation.getPropertyById), getPropertyById(), controller.getProperty)

router
    .route("/:propertyId/thumbnails")
    .put(
        uploadImage.single("thumbnail"),
        validate(validation.replaceThumbnail),
        auth(),
        getPropertyById(),
        requireToOwnProperty(),
        controller.replaceThumbnail,
    )

router
    .route("/:propertyId/accom-groups")
    .post(
        auth(),
        validate(validation.addAccommodationGroup),
        getPropertyById(),
        requireToOwnProperty(),
        controller.addAccommodationGroup,
    )

router
    .route("/:propertyId/accom-groups/:accomGroupId/accoms")
    .post(
        auth(),
        validate(validation.addAccommodations),
        getPropertyById(),
        getAccomGroupById(),
        requireToOwnProperty(),
        controller.addAccommodations,
    )

module.exports = router
