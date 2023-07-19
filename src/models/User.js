const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcryptjs")

const { authTypes, genders } = require("../constants")
const { NORMAL_USER, ADMIN } = require("../configs/roles")
const { toJSON, paginate } = require("./plugins")
const moment = require("moment")
const { addressSchema } = require("./subdocs")

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

        isEmailVerified: { type: Boolean, default: false, private: true, required: true },

        authType: {
            type: String,
            enum: Object.values(authTypes), // local or google validation
            default: authTypes.LOCAL,
            private: true,
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

        role: {
            type: String,
            default: NORMAL_USER,
            enum: [NORMAL_USER, ADMIN],
            private: true,
            required: true,
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
    { timestamps: true, optimisticConcurrency: true },
)

userSchema.plugin(toJSON)
userSchema.plugin(paginate)

/**
 * Check if password matches user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
    const user = this
    return bcrypt.compare(password, user.password)
}

const User = mongoose.model("User", userSchema)

module.exports = User
