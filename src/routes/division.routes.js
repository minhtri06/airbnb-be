const router = require("express").Router()

const { validate } = require("../middlewares")
const { divisionController: controller } = require("../controllers")
const { divisionValidation: validation } = require("../validation")

router.get("/p", controller.getProvinces)
router.get("/d", validate(validation.getDistricts), controller.getDistricts)

module.exports = router
