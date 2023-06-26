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
    .post(auth(), validate(validation.createProperty), controller.createProperty)

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
