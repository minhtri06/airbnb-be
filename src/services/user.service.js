const createError = require("http-errors")
const bcrypt = require("bcryptjs")

const { User } = require("../models")
const envConfig = require("../configs/envConfig")
const {
    authTypes: { LOCAL, GOOGLE },
} = require("../constants")
const { pickFields } = require("../utils")

/**
 * Hash password
 * @param {string} password
 * @returns {Promise<string>}
 */
const hashPassword = async (password) => {
    return await bcrypt.hash(password, 8)
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
    updateBody.updateBody = pickFields(
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

    return user
}

module.exports = {
    isEmailTaken,
    paginateUsers,
    findOneUser,
    findUserById,
    getOneUser,
    getUserById,
    createUser,
    updateUser,
}

/**
 * @typedef {InstanceType<User>} user
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
