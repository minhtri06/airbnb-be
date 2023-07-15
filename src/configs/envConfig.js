require("dotenv").config()
const Joi = require("joi")
const {
    nodeEnv: { PRODUCTION, DEVELOPMENT, TEST },
} = require("../constants")

const envSchema = Joi.object({
    PORT: Joi.number().integer().required(),

    NODE_ENV: Joi.string().valid(PRODUCTION, DEVELOPMENT, TEST).required(),

    CLIENT_URL: Joi.string().required(),

    DEFAULT_PAGE_LIMIT: Joi.number().integer().required(),

    MONGODB_URL: Joi.string().required(),
    DB_NAME: Joi.string().required(),

    REDIS_URL: Joi.string().required(),
    REDIS_DEFAULT_EXPIRATION: Joi.number().integer().required(),

    JWT_SECRET: Joi.string().required(),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().integer().min(1).required(),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().integer().min(1).required(),

    SMTP_HOST: Joi.string().required(),
    SMTP_PORT: Joi.number().integer().required(),
    SMTP_USERNAME: Joi.string().required(),
    SMTP_PASSWORD: Joi.string().required(),
    EMAIL_FROM: Joi.string().required(),
}).unknown()

const { value: envVars, error } = envSchema.validate(process.env)
if (error) {
    throw new Error("Config validation error: " + error.message)
}

const envConfig = {
    PORT: envVars.PORT,
    NODE_ENV: envVars.NODE_ENV,
    CLIENT_URL: envVars.CLIENT_URL,

    DEFAULT_PAGE_LIMIT: envVars.DEFAULT_PAGE_LIMIT,

    mongodb: {
        URL: envVars.MONGODB_URL,
        DB_NAME: envVars.DB_NAME,
    },

    redis: {
        URL: envVars.REDIS_URL,
        DEFAULT_EXPIRATION: envVars.REDIS_DEFAULT_EXPIRATION,
    },

    jwt: {
        SECRET: envVars.JWT_SECRET,
        ACCESS_EXPIRATION_MINUTES: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
        REFRESH_EXPIRATION_DAYS: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    },

    email: {
        smtp: {
            host: envVars.SMTP_HOST,
            port: envVars.SMTP_PORT,
            auth: {
                user: envVars.SMTP_USERNAME,
                pass: envVars.SMTP_PASSWORD,
            },
        },
        from: envVars.EMAIL_FROM,
    },
}

module.exports = envConfig
