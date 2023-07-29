const router = require("express").Router()

router.use("/auth", require("./auth.routes"))
router.use("/bookings", require("./booking.routes"))
router.use("/divisions", require("./division.routes"))
router.use("/me", require("./me.routes"))
router.use("/properties", require("./property.routes"))
router.use("/reviews", require("./review.routes"))
router.use("/users", require("./user.routes"))
router.use("/chats", require("./chat.routes"))
router.get("/test", (req, res) => {
    console.log("yolo")
    return res.status(204).send()
})

module.exports = router
