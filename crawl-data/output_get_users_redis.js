const { redis } = require("../src/configs/envConfig")
const redisClient =  require("../src/db/redisClient")

redisClient.connect().then(async () => {
    for (let i = 0; i < 1000; i++ ) {
        await redisClient.setEx("user:id"+ i, 3600, JSON.stringify({
            user_id: `Tuan Le ${i}`,
            user_name: `Tuan Le ${i}`,
            user_email: `Tuan Le ${i}`,
            user_password: `Tuan Le ${i}`,
            user_authType: `Tuan Le ${i}`,
            user_roles: `Tuan Le ${i}`,
            user_avatar: `Tuan Le ${i}`,
            user_dateOfBirth: `Tuan Le ${i}`,
            user_gender: `Tuan Le ${i}`,
            user_address: `Tuan Le ${i}`,
        }))
    }
    await redisClient.quit()
})