const mongoose = require("mongoose")
const validator = require("validator")

const { authTypes, genders } = require("../constants")
const roles = require("../configs/roles")
const { toJSON } = require("./plugins")
const moment = require("moment")
const bcrypt = require("bcryptjs")
const { addressSchema } = require("./subdocs")

const { Schema } = mongoose

const userSchema = new Schema({
    name: { type: String, required: true, trim: true },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.default.isEmail(value)) {
                throw new Error("Invalid email")
            }
        },
    },
    authType: {
        type: String,
        enum: Object.values(authTypes), // local or google validation
        default: authTypes.LOCAL,
        required: true,
    },
    password: {
        type: String,
        required: function () {
            // If use local authentication, then password's required
            return this.get("authType") === authTypes.LOCAL
        },
        minlength: 6,
        validate(value) {
            if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
                throw new Error(
                    "Password must contain at least one letter and one number",
                )
            }
        },
        private: true, // used by the toJSON plugin
    },
    roles: {
        type: [String],
        default: [roles.NORMAL_USER],
        enum: Object.values(roles),
        private: true,
        validate(values) {
            // In case array have undefined value
            values.forEach((value) => {
                if (!value) {
                    throw new Error(`Invalid role '${value}'`)
                }
            })
        },
    },
    avatar: { type: String },
    phoneNumber: { type: String, trim: true },
    dateOfBirth: {
        type: Date,
        validate(value) {
            return moment(value).isBefore(new Date())
        },
    },
    gender: { type: String, lowercase: true, enum: Object.values(genders) },
    address: {
        type: addressSchema,
        default: () => ({}),
    },
})

userSchema.plugin(toJSON)

/**
 * Check if email is taken
 * @param {string} email
 * @param {ObjectId} excludedUserId - If given, specify a user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email, excludedUserId = undefined) {
    const query = this.findOne({ email })
    if (excludedUserId) {
        query.where({ _id: { $ne: excludedUserId } })
    }
    const user = await query.exec()
    return !!user
}

/**
 * Check if password matches user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
    const user = this
    return bcrypt.compare(password, user.password)
}

userSchema.pre("save", async function (next) {
    const user = this
    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

const User = mongoose.model("User", userSchema)

module.exports = User
