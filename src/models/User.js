const mongoose = require("mongoose")
const validator = require("validator")

const { authTypes, genders } = require("../constants")
const roles = require("../configs/roles")
const { toJSON, paginate } = require("./plugins")
const moment = require("moment")
const bcrypt = require("bcryptjs")
const { addressSchema } = require("./subdocs")
const { redisClient } = require("../db")

const { Schema } = mongoose

const userSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            validate(email) {
                if (this.isModified("email")) {
                    if (!validator.default.isEmail(email)) {
                        throw new Error("Invalid email")
                    }
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
                if (this.isModified("password")) {
                    if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
                        throw new Error(
                            "Password must contain at least one letter and one number",
                        )
                    }
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
                if (this.isModified("roles")) {
                    // In case array have undefined value
                    values.forEach((value) => {
                        if (!value) {
                            throw new Error(`Invalid role '${value}'`)
                        }
                    })
                }
            },
        },
        avatar: { type: String },
        phoneNumber: { type: String, trim: true },
        dateOfBirth: {
            type: Date,
            validate(value) {
                if (this.isModified("dateOfBirth")) {
                    if (moment(value).isAfter(new Date())) {
                        throw new Error("Date of birth must be before current time")
                    }
                }
            },
        },
        gender: { type: String, lowercase: true, enum: Object.values(genders) },
        address: {
            type: addressSchema,
            default: undefined,
        },
    },
    { timestamps: true },
)

userSchema.plugin(toJSON)
userSchema.plugin(paginate)

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

// Every time we save, we delete cache
userSchema.post("save", async function (doc) {
    const user = doc
    await redisClient.del(`user:${user._id}`)
})

const User = mongoose.model("User", userSchema)

module.exports = User
