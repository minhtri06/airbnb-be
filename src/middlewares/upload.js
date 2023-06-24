const util = require("util")
const multer = require("multer")
const createError = require("http-errors")

const maxSize = 2 * 1024 * 1024

const imageFilter = (req, file, cb) => {
    const [type, extension] = file.mimetype.split("/")
    if (type !== "image") {
        cb(createError.BadRequest("Invalid image"))
    } else {
        cb(null, true)
    }
}

const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, process.cwd() + "/src/static/img")
    },
})

const uploadImage = (fieldName) =>
    util.promisify(
        multer({
            storage: imageStorage,
            limits: { fileSize: maxSize },
            fileFilter: imageFilter,
        }).single(fieldName),
    )

const uploadManyImages = (fieldName) =>
    util.promisify(
        multer({
            storage: imageStorage,
            limits: { fileSize: maxSize },
            fileFilter: imageFilter,
        }).array(fieldName),
    )

module.exports = { uploadImage, uploadManyImages }
