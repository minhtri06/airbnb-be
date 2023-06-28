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

/** @type {import('express').RequestHandler} */
const replaceMyAvatar = async (req, res) => {
    const avatar = await service.replaceMyAvatar(req.user, req.file)
    return res.json({ avatar })
}

module.exports = {
    getMyProfile,
    updateMyProfile,
    replaceMyAvatar,
}
