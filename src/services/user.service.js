const createError = require("http-errors")

const { User } = require("../models")
const envConfig = require("../configs/envConfig")
// const { updateImage } = require("../utils")

const getUserById = async (userId) => {
    const user = await User.findById(userId)
    if (!user) {
        throw new createError.NotFound("User not found")
    }
    return user
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
    page = page || 1
    let skip = (page - 1) * limit
    query.limit(limit)
    query.skip(skip)
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
