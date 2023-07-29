const createError = require("http-errors")
const bcrypt = require("bcryptjs")
const qs = require("qs")
const axios = require("axios")

const { User, SavedProperty } = require("../models")
const envConfig = require("../configs/envConfig")
const {
    authTypes: { LOCAL, GOOGLE },
} = require("../constants")
const {
    pickFields,
    file: { deleteStaticFile },
} = require("../utils")

/**
 * Hash password
 * @param {string} password
 * @returns {Promise<string>}
 */
const hashPassword = async (password) => {
    return await bcrypt.hash(password, 8)
}

/**
 * Find one user, return null if not found
 * @param {userFilter} filter
 * @returns {Promise<user | null>}
 */
const findOneUser = async (filter) => {
    return User.findOne(filter)
}

/**
 * Find user by id, return null if not found
 * @param {string} userId
 * @returns {Promise<user | null>}
 */
const findUserById = async (userId) => {
    return findOneUser({ _id: userId })
}

/**
 * Get one user, throw error if not found
 * @param {userFilter} filter
 * @returns {Promise<user>}
 */
const getOneUser = async (filter) => {
    const user = await findOneUser(filter)
    if (!user) {
        throw createError.NotFound("User not found")
    }
    return user
}

/**
 * Get user by id, throw error if not found
 * @param {string} userId
 * @returns {Promise<user>}
 */
const getUserById = async (userId) => {
    const user = await getOneUser({ _id: userId })
    return user
}

/**
 * Check if email is taken
 * @param {string} email
 * @param {string} excludedUserId - If given, specify a user to be excluded
 * @returns {Promise<boolean>}
 */
const isEmailTaken = async (email, excludedUserId = undefined) => {
    const query = User.findOne({ email })
    if (excludedUserId) {
        query.where({ _id: { $ne: excludedUserId } })
    }
    const user = await query.exec()
    return user !== null
}

/**
 * Paginate users
 * @param {userFilter} filter
 * @param {queryOptions} queryOptions
 * @returns {Promise<user[]>}
 */
const paginateUsers = async (filter, queryOptions) => {
    return User.paginate(filter, queryOptions)
}

/**
 * Create a new user
 * @param {{
 *   name,
 *   email,
 *   authType,
 *   password,
 *   role,
 *   phoneNumber,
 *   dateOfBirth,
 *   gender,
 *   address,
 * }} body
 * @returns
 */
const createUser = async (body) => {
    body = pickFields(
        body,
        "name",
        "email",
        "authType",
        "password",
        "role",
        "avatar",
        "phoneNumber",
        "dateOfBirth",
        "gender",
        "address",
    )

    const user = new User(body)

    if (user.authType === LOCAL) {
        if (!user.password) {
            throw createError.BadRequest("password field is required")
        }
        user.password = await hashPassword(user.password)
    }
    if (user.authType === GOOGLE) {
        user.password = undefined
        user.isEmailVerified = true
    }

    await user.save()

    return user
}

/**
 * Remove user cache
 * @param {string} userId
 */
const deleteUserCache = async (userId) => {
    const redisService = require("./redis.service")
    await redisService.removeUser(userId)
}

/**
 * Update a user
 * @param {user} user
 * @param {{
 *   name,
 *   isEmailVerified,
 *   password,
 *   phoneNumber,
 *   dateOfBirth,
 *   gender,
 *   address,
 * }} updateBody
 * @returns {Promise<user>}
 */
const updateUser = async (user, updateBody) => {
    updateBody = pickFields(
        updateBody,
        "name",
        "isEmailVerified",
        "password",
        "phoneNumber",
        "dateOfBirth",
        "gender",
        "address",
    )

    if (updateBody.password) {
        updateBody.password = await hashPassword(updateBody.password)
    }

    Object.assign(user, updateBody)

    await user.save()

    await deleteUserCache(user._id)

    return user
}

/**
 * Replace user avatar
 * @param {user} user
 * @param {{}} file
 */
const replaceUserAvatar = async (user, file) => {
    let oldAvatar
    if (user.avatar) {
        oldAvatar = user.avatar.split(envConfig.SERVER_URL)[1]
    }

    user.avatar = `${envConfig.SERVER_URL}/img/${file.filename}`
    await user.save()

    if (oldAvatar) {
        await deleteStaticFile(oldAvatar)
    }

    await deleteUserCache(user._id)

    return user.avatar
}

/**
 * Save a property
 * @param {string} userId
 * @param {string} propertyId
 * @returns {Promise<savedProperty>}
 */
const saveProperty = async (userId, propertyId) => {
    const savedProperty = new SavedProperty({ user: userId, property: propertyId })
    return savedProperty.save()
}

/**
 * Un-save a property
 * @param {string} userId
 * @param {string} propertyId
 * @returns {Promise<>}
 */
const unSaveProperty = async (userId, propertyId) => {
    return SavedProperty.deleteMany({ user: userId, property: propertyId })
}

/**
 * Check if a property is saved or not
 * @param {string} userId
 * @param {string} propertyId
 * @returns {Promise<boolean>}
 */
const isPropertySaved = async (userId, propertyId) => {
    const savedProperty = await SavedProperty.findOne({
        user: userId,
        property: propertyId,
    })
    return savedProperty !== null
}

/**
 * Check properties is saved or not.
 * Return an array specify each property is saved or not
 * @param {string} userId
 * @param {string[]} propertyIds
 * @returns {Promise<boolean[]>}
 */
const checkSaveProperties = async (userId, propertyIds) => {
    const savedProperties = await SavedProperty.find({
        user: userId,
        property: { $in: propertyIds },
    })

    const savedPropertyIds = savedProperties.map((sp) => sp.property)

    return propertyIds.map((propertyId) => {
        return savedPropertyIds.some((savedId) => savedId.equals(propertyId))
    })
}

module.exports = {
    findOneUser,
    findUserById,
    getOneUser,
    getUserById,
    isEmailTaken,
    paginateUsers,
    createUser,
    updateUser,
    replaceUserAvatar,
    saveProperty,
    unSaveProperty,
    isPropertySaved,
    checkSaveProperties,
}

/**
 * @typedef {InstanceType<User>} user
 * @typedef {InstanceType<SavedProperty>} savedProperty
 *
 * @typedef {Object} userFilter
 * @property {String} _id
 * @property {String} name
 * @property {String} email
 * @property {boolean} isEmailVerified
 * @property {string} authType
 * @property {String} role
 * @property {String} phoneNumber
 * @property {String} dateOfBirth
 * @property {String} gender
 * @property {String} address
 *
 * @typedef {Object} queryOptions
 * @property {Object} sortBy
 * @property {number} page
 * @property {number} limit
 * @property {string} select
 * @property {string} populate
 * @property {boolean} lean
 */
