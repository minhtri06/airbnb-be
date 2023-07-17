const createError = require("http-errors")

const { divisionService: service } = require("../services")

/** @type {controller} */
const getAllProvinces = async (req, res) => {
    const provinces = await service.getAllProvinces()
    return res.json({ provinces })
}

/** @type {controller} */
const getAllDistricts = async (req, res) => {
    const districts = await service.getAllDistricts(req.query)
    return res.json({ districts })
}

module.exports = {
    getAllProvinces,
    getAllDistricts,
}

/**
 * @typedef {InstanceType<import("../models/Property")>} property
 * @typedef {InstanceType<import("../models/User")>} user
 *
 * @typedef {{
 *   user: user,
 *   _user: user,
 *   _property: property
 * }} attachedData
 *
 * @typedef {import('express').Request & attachedData} req
 * @typedef {import('express').Response} res
 *
 * @callback controller
 * @param {req} req
 * @param {res} res
 */
