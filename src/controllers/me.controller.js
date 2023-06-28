const { meService: service } = require("../services")

/** @type {import('express').RequestHandler} */
const getMyProfile = async (req, res) => {
    return res.json({ myProfile: req.user })
}

/** @type {import('express').RequestHandler} */
const updateMyProfile = async (req, res) => {
    const myProfile = await service.updateMyProfile(req.user, req.body)
    return res.json({ myProfile })
}

module.exports = {
    getMyProfile,
    updateMyProfile,
}
