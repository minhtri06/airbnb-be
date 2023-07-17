const createError = require("http-errors")
const {
    pickFields,
    file: { deleteStaticFile },
} = require("../utils")
const { User, Property } = require("../models")

const updateMyProfile = async (me, updateBody) => {
    updateBody = pickFields(
        updateBody,
        "name",
        "phoneNumber",
        "dateOfBirth",
        "gender",
        "address",
    )
    Object.assign(me, updateBody)
    await me.save()
    return me
}

/**
 *
 * @param {InstanceType<User>} me
 * @param {{}} file
 */
const replaceMyAvatar = async (me, file) => {
    if (!file) {
        throw createError.BadRequest("Avatar is required")
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
