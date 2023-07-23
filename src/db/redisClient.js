const { createClient } = require("redis")

const envConfig = require("../configs/envConfig")
console.log(envConfig.redis.URL)
const redisClient = createClient(envConfig.redis.URL)

module.exports = redisClient
