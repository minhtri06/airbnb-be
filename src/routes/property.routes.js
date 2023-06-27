const router = require("express").Router()

const {
    validate,
    auth,
    upload: { uploadManyImages, uploadManyImage },
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
    controller.getPropertyByPageName,
)

router
    .route("/:propertyId")
    .get(validate(validation.getPropertyById), controller.getPropertyById)

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
