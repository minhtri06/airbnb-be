const mongoose = require("mongoose")

const createMongooseValidationErr = (path, message) => {
    const validationError = new mongoose.Error.ValidationError(null)
    validationError.addError(path, new mongoose.Error.ValidatorError({ message }))
    return validationError
}

module.exports = createMongooseValidationErr
