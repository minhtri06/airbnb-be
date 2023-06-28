const createError = require("http-errors")
const {
    pickFields,
    file: { deleteStaticFile },
} = require("../utils")
const { User } = require("../models")
const userService = require("./user.service")

const updateMyProfile = async (myProfile, updateBody) => {
    updateBody = pickFields(
        updateBody,
        "name",
        "phoneNumber",
        "dateOfBirth",
        "gender",
        "address",
    )
    Object.assign(myProfile, updateBody)
    await myProfile.save()
    return myProfile
}

/**
 *
 * @param {InstanceType<User>} me
 * @param {{}} file
 */
const replaceMyAvatar = async (me, file) => {
    if (!file) {
        throw createError.BadRequest("File is required")
    }
    if (me.avatar) {
        await deleteStaticFile(me.avatar)
    }
    me.avatar = `/img/${file.filename}`
    await me.save()
    return me.avatar
}

module.exports = {
    updateMyProfile,
    replaceMyAvatar,
}
