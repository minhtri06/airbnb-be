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
    .route("/:propertyId/rooms")
    .post(auth(), validate(validation.addRooms), controller.addRooms)

module.exports = router
