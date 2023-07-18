const createError = require("http-errors")
const { ValidationError } = require("mongoose").Error
const {
    StatusCodes: { BAD_REQUEST, INTERNAL_SERVER_ERROR },
} = require("http-status-codes")

const { PRODUCTION } = require("../constants").nodeEnv
const envConfig = require("../configs/envConfig")
const { deleteFile } = require("../utils").file

/** @type {import('express').ErrorRequestHandler} */
const handleException = async (err, req, res, next) => {
    // Delete uploading files

    if (req.file) {
        deleteFile(req.file.path)
    }
    if (req.files && req.files instanceof Array) {
        for (let file of req.files) {
            deleteFile(file.path)
        }
    }

    // Response to the client

    if (err instanceof createError.HttpError) {
        return res.status(err.statusCode).json({ message: err.message })
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

    if (envConfig.NODE_ENV !== PRODUCTION) {
        console.log(err)
        return res.status(INTERNAL_SERVER_ERROR).json({ message: err.message })
    } else {
        return res.status(INTERNAL_SERVER_ERROR).json({ message: "Something went wrong" })
    }
}

module.exports = handleException
