const createError = require("http-errors")
const { ValidationError } = require("mongoose").Error
const { StatusCodes } = require("http-status-codes")

const { PRODUCTION } = require("../constants").nodeEnv
const envConfig = require("../configs/envConfig")
const { deleteFile } = require("../utils").file

/** @type {import('express').ErrorRequestHandler} */
const handleException = async (err, req, res, next) => {
    if (req.file) {
        await deleteFile(req.file.path)
    }
    if (req.files) {
        await Promise.all(req.files.map((file) => deleteFile(file.path)))
    }
    if (envConfig.NODE_ENV !== PRODUCTION) {
        if (err instanceof createError.HttpError) {
            return res.status(err.statusCode).json({ message: err.message })
        } else if (err instanceof ValidationError) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ message: err.message.replaceAll('"', "'") })
        } else {
            console.log(err)
            return res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .json({ message: err.message })
        }
    } else {
        if (err instanceof createError.HttpError) {
            return res.status(err.statusCode).json({ message: err.message })
        } else if (err instanceof ValidationError) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Bad request" })
        } else {
            return res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .json({ message: "Something went wrong" })
        }
    }
}

module.exports = handleException
