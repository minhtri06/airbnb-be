const { createClient } = require("redis")

const envConfig = require("../configs/envConfig")

const redisClient = createClient({ url: envConfig.redis.URL })

module.exports = redisClient
