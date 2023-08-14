const router = require("express").Router()

const {
    generalMiddlewares: { auth, validate },
} = require("../middlewares")
const { chatValidation: validation } = require("../validation")
const { chatController: controller } = require("../controllers")

router
    .route("/messages")
    .get(auth(), validate(validation.getMessages), controller.getMessages)
    .post(auth(), validate(validation.addMessage), controller.addMessage)

module.exports = router
