const createError = require("http-errors")

const { ACCESS, REFRESH } = require("../constants").tokenTypes
const userService = require("./user.service")
const tokenService = require("./token.service")

const registerUser = async (userBody) => {
    const { name, email, password, dateOfBirth, gender, address } = userBody
    const user = await userService.createUser({
        name,
        email,
        password,
        dateOfBirth,
        gender,
        address,
    })
    const authTokens = await tokenService.createAuthTokens(user._id)
    return { user, authTokens }
}

module.exports = {
    registerUser,
}
