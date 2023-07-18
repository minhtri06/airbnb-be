const createError = require("http-errors")

const { pickFields } = require("../utils")
const { divisionService: service } = require("../services")

/** @type {controller} */
const getProvinces = async (req, res) => {
    const provinces = await service.findProvinces({})
    return res.json({ provinces })
}

/** @type {controller} */
const getDistricts = async (req, res) => {
    req.query = pickFields(req.query, "provinceCode", "provinceId")
    const districts = await service.findDistricts(req.query)
    return res.json({ districts })
}

module.exports = {
    getProvinces,
    getDistricts,
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
