const createError = require("http-errors")

const { User } = require("../models")
const redisService = require("./redis.service")
const envConfig = require("../configs/envConfig")
// const { updateImage } = require("../utils")

const getUserById = async (userId, { populateDivision }) => {
    const query = User.findById(userId)
    if (populateDivision) {
        query.populate(["address.province", "address.district"])
    }
    return await query.exec()
}

const getUserByEmail = async (email) => {
    return await User.findOne({ email })
}

const queryUser = async ({
    name,
    email,
    role,
    phoneNumber,
    districtId,
    provinceId,
    limit,
    page,
}) => {
    const query = User.where()
    if (name) {
        query.where({ name: { $regex: ".*" + name + ".*" } })
    }
    if (email) {
        query.where({ email })
    }
    if (role) {
        query.where({ role })
    }
    if (phoneNumber) {
        query.where({ phoneNumber })
    }
    if (districtId) {
        query.where({ "address.district": districtId })
    }
    if (provinceId) {
        query.where({ "address.province": provinceId })
    }
    limit = limit || envConfig.DEFAULT_PAGE_LIMIT
    page = ((page || 1) - 1) * envConfig.DEFAULT_PAGE_LIMIT
    query.limit(limit)
    query.skip(page)
    return await query.exec()
}

const createUser = async (userBody) => {
    const user = new User(userBody)
    await user.save()
    await user.populate(["address.province", "address.district"])
    return user
}

module.exports = {
    getUserById,
    getUserByEmail,
    queryUser,
    createUser,
}
