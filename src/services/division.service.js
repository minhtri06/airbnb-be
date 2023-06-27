const createError = require("http-errors")

const { Province, District } = require("../models")

const getAllProvinces = async () => {
    return await Province.find()
}

const getAllDistricts = async ({ provinceCode, provinceId }) => {
    const query = District.where()
    if (provinceCode) {
        query.where({ provinceCode })
    }
    if (provinceId) {
        query.where({ province: provinceId })
    }
    return await query.exec()
}

module.exports = {
    getAllProvinces,
    getAllDistricts,
}
