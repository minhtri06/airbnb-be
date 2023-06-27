const { userService } = require("../services")

/** @type {import('express').RequestHandler} */
const getMyProfile = (req, res) => {
    return res.json({ myProfile: req.user })
}

module.exports = {
    getMyProfile,
}
