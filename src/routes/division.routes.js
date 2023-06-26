const router = require("express").Router()

const { validate } = require("../middlewares")
const { divisionController: controller } = require("../controllers")
const { divisionValidation: validation } = require("../validation")

router.get("/p", controller.getAllProvinces)
router.get("/d", validate(validation.getAllDistricts), controller.getAllDistricts)

module.exports = router
