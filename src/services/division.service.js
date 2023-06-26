const createError = require("http-errors")

const { Province, District } = require("../models")

const getAllProvinces = async () => {
    return await Province.find()
}

const getAllDistricts = async ({ provinceCode }) => {
    const query = District.where()
    if (provinceCode) {
        query.where({ provinceCode })
    }
    return await query.exec()
}

module.exports = {
    getAllProvinces,
    getAllDistricts,
}
