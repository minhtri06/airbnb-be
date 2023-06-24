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
    .post(
        auth(),
        uploadManyImages("images"),
        validate(validation.createProperty),
        controller.createProperty,
    )

module.exports = router
