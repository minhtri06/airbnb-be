const createError = require("http-errors")

const { Province, District } = require("../models")

const getAllProvinces = async () => {
    return await Province.find()
}

const getAllDistricts = async () => {
    return await District.find()
}

module.exports = {
    getAllProvinces,
    getAllDistricts,
}
