const router = require("express").Router()

const {
    generalMiddlewares: { auth, validate },
    chatMiddleware: { getConversationById, requireToBeConversationMember },
} = require("../middlewares")
const { chatValidation: validation } = require("../validation")
const { chatController: controller } = require("../controllers")

router.param("conversationId", getConversationById)

router.post(
    "/conversations",
    auth(),
    validate(validation.makeConversation),
    controller.makeConversation,
)

router
    .route("/conversations/:conversationId/messages")
    .get(
        auth(),
        requireToBeConversationMember(),
        validate(validation.getConversationMessages),
        controller.getConversationMessages,
    )
    .post(
        auth(),
        requireToBeConversationMember(),
        validate(validation.postMessage),
        controller.postMessage,
    )

module.exports = router
