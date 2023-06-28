const { pickFields } = require("../utils")
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

module.exports = {
    updateMyProfile,
}
