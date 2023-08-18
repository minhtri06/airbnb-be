const util = require("util")
const multer = require("multer")
const cloudinary = require("cloudinary").v2
const { CloudinaryStorage } = require("multer-storage-cloudinary")
const createError = require("http-errors")
const { v4: uuidV4 } = require("uuid")

const envConfig = require("../../configs/envConfig")

const maxSize = 2 * 1024 * 1024

cloudinary.config({
    cloud_name: envConfig.cloudinary.NAME,
    api_key: envConfig.cloudinary.API_KEY,
    api_secret: envConfig.cloudinary.API_SECRET,
})

const imageFilter = (req, file, cb) => {
    const [type, extension] = file.mimetype.split("/")
    if (type !== "image") {
        cb(createError.BadRequest("Invalid image"))
    } else {
        file.extension = extension
        cb(null, true)
    }
}

const imageStorage = new CloudinaryStorage({
    cloudinary,
    allowedFormats: ["jpg", "png", "jpeg"],
    params: { folder: "airbnb" },
})

// const imageStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, process.cwd() + "/src/static/img")
//     },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = uuidV4()
//         cb(null, file.fieldname + "-" + uniqueSuffix + "." + file.extension)
//     },
// })

const uploadSingleImage = (fieldName, { required } = { required: true }) => {
    return [
        util.promisify(
            multer({
                storage: imageStorage,
                limits: { fileSize: maxSize },
                fileFilter: imageFilter,
            }).single(fieldName),
        ),
        (req, res, next) => {
            if (required && !req.file) {
                throw createError.BadRequest(`${fieldName} is required`)
            }
            return next()
        },
    ]
}

const uploadManyImages = (
    fieldName,
    { maxCount, required } = { maxCount: 100, required: true },
) => {
    return [
        util.promisify(
            multer({
                storage: imageStorage,
                limits: { fileSize: maxSize },
                fileFilter: imageFilter,
            }).array(fieldName, maxCount),
        ),
        (req, res, next) => {
            if (required && !req.files) {
                throw createError.BadRequest(`${fieldName} is required`)
            }
            return next()
        },
    ]
}

const uploadFieldsImages = (fields, { required } = { required: true }) => {
    return [
        util.promisify(
            multer({
                storage: imageStorage,
                limits: { fileSize: maxSize },
                fileFilter: imageFilter,
            }).fields(fields),
        ),
        (req, res, next) => {
            if (required && !req.files) {
                throw createError.BadRequest("Image fields is required")
            }
            next()
        },
    ]
}

module.exports = {
    uploadImage: {
        single: uploadSingleImage,
        many: uploadManyImages,
        fields: uploadFieldsImages,
    },
}
