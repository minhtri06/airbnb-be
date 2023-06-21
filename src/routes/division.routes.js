const router = require("express").Router()

const { divisionController: controller } = require("../controllers")

router.get("/p", controller.getAllProvinces)
router.get("/d", controller.getAllDistricts)

module.exports = router
