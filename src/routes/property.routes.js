const router = require("express").Router()

const {
    validate,
    auth,
    upload: { uploadImage },
    propertyMiddleware: { getPropertyById, getPropertyByPageName, requireToOwnProperty },
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
    .route("/:propertyId/accom-groups")
    .post(
        auth(),
        validate(validation.addAccommodationGroup),
        controller.addAccommodationGroup,
    )

router
    .route("/:propertyId/accom-groups/:accomGroupId/accoms")
    .post(auth(), controller.addAccommodations)

module.exports = router
