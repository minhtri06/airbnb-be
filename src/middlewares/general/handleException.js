const createError = require("http-errors")
const { ValidationError } = require("mongoose").Error
const {
    StatusCodes: { BAD_REQUEST, INTERNAL_SERVER_ERROR, UNAUTHORIZED },
} = require("http-status-codes")
const cloudinary = require("cloudinary").v2

const { PRODUCTION } = require("../../constants").nodeEnv
const envConfig = require("../../configs/envConfig")

/** @type {import('express').ErrorRequestHandler} */
const handleException = async (err, req, res, next) => {
    // Delete uploading files
    if (req.file) {
        cloudinary.uploader.destroy(req.file.filename)
    }
    if (req.files && req.files instanceof Array) {
        cloudinary.api.delete_resources(req.files.map((file) => file.filename))
    }

    // Response to the client
    if (err instanceof createError.HttpError) {
        return res
            .status(err.statusCode)
            .json({ type: err.headers?.type, message: err.message })
    }

    if (err instanceof ValidationError) {
        return res.status(BAD_REQUEST).json({ message: err.message.replaceAll('"', "'") })
    }

    if (err.code === 11000) {
        const { keyValue } = err
        const message = Object.keys(keyValue)
            .map((key) => `${key} with value '${keyValue[key]}' already exists`)
            .join(", ")
        return res.status(BAD_REQUEST).json({ message })
    }

    // Google authentication fail
    if (err.oauthError === 401) {
        return res.status(UNAUTHORIZED).json({ message: "Unauthorized" })
    }

    if (envConfig.NODE_ENV !== PRODUCTION) {
        console.log(err)
        return res.status(INTERNAL_SERVER_ERROR).json({ message: err.message })
    } else {
        return res.status(INTERNAL_SERVER_ERROR).json({ message: "Something went wrong" })
    }
}

module.exports = handleException
