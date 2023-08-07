const router = require("express").Router()

const {
    generalMiddlewares: { auth, validate },
    reviewMiddleware: { getReviewById, requireToBeReviewer },
} = require("../middlewares")
const { reviewController: controller } = require("../controllers")
const { reviewValidation: validation } = require("../validation")

router.param("reviewId", getReviewById)

router
    .route("/")
    .get(validate(validation.getReviews), controller.getReviews)
    .post(auth(), validate(validation.addReview), controller.addReview)

router
    .route("/:reviewId")
    .patch(
        auth(),
        requireToBeReviewer(),
        validate(validation.editReview),
        controller.editReview,
    )

module.exports = router
