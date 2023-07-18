const createError = require("http-errors")

const { Province, District } = require("../models")

/**
 * Find one province, return null if not found
 * @param {provinceFilter} filter
 * @returns {Promise<province | null>}
 */
const findOneProvince = async (filter) => {
    return Province.findOne(filter)
}

/**
 * Find province by id, return null if not found
 * @param {string} provinceId
 * @returns {Promise<province | null>}
 */
const findProvinceById = async (provinceId) => {
    return findOneProvince({ _id: provinceId })
}

/**
 * Get one province, throw error if not found
 * @param {provinceFilter} filter
 * @returns {Promise<province>}
 */
const getOneProvince = async (filter) => {
    const province = await findOneProvince(filter)
    if (!province) {
        throw createError.NotFound("Province not found")
    }
    return province
}

/**
 * Get province by id, throw error if not found
 * @param {string} provinceId
 * @returns {Promise<province>}
 */
const getProvinceById = async (provinceId) => {
    const province = await getOneProvince({ _id: provinceId })
    return province
}

const findProvinces = async (filter) => {
    return Province.find(filter)
}

/**
 * Find one district, return null if not found
 * @param {districtFilter} filter
 * @returns {Promise<district | null>}
 */
const findOneDistrict = async (filter) => {
    return District.findOne(filter)
}

/**
 * Find district by id, return null if not found
 * @param {string} districtId
 * @returns {Promise<district | null>}
 */
const findDistrictById = async (districtId) => {
    return findOneDistrict({ _id: districtId })
}

/**
 * Get one district, throw error if not found
 * @param {districtFilter} filter
 * @returns {Promise<district>}
 */
const getOneDistrict = async (filter) => {
    const district = await findOneDistrict(filter)
    if (!district) {
        throw createError.NotFound("District not found")
    }
    return district
}

/**
 * Get district by id, throw error if not found
 * @param {string} districtId
 * @returns {Promise<district>}
 */
const getDistrictById = async (districtId) => {
    const district = await getOneDistrict({ _id: districtId })
    return district
}

const findDistricts = async (filter) => {
    return Province.find(filter)
}

module.exports = {
    findOneProvince,
    findProvinceById,
    getOneProvince,
    getProvinceById,
    findProvinces,
    findOneDistrict,
    findDistrictById,
    getOneDistrict,
    getDistrictById,
    findDistricts,
}

/**
 * @typedef {InstanceType<Province>} province
 * @typedef {InstanceType<District>} district
 *
 * @typedef {Object} provinceFilter
 * @property {string} _id
 * @property {string} name
 * @property {string} divisionType
 * @property {number} code
 *
 * @typedef {Object} districtFilter
 * @property {string} _id
 * @property {string} name
 * @property {string} divisionType
 * @property {number} code
 * @property {number} provinceCode
 * @property {string} province
 */
