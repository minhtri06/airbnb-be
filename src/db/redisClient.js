const { createClient } = require("redis")

const envConfig = require("../configs/envConfig")

const redisClient = createClient()

module.exports = redisClient
