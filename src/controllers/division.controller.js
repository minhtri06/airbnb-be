const createError = require("http-errors")

const { divisionService: service } = require("../services")

/** @type {import('express').RequestHandler} */
const getAllProvinces = async (req, res) => {
    const provinces = await service.getAllProvinces()
    return res.json({ provinces })
}

const getAllDistricts = async (req, res) => {
    const districts = await service.getAllDistricts()
    return res.json({ districts })
}

module.exports = {
    getAllProvinces,
    getAllDistricts,
}
