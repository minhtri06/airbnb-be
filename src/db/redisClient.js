const { createClient } = require("redis")

const envConfig = require("../configs/envConfig")

const redisClient = createClient(envConfig.redis.URL)

module.exports = redisClient
