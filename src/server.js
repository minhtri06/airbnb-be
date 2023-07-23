const app = require("./app")
const { connectMongoDb, redisClient } = require("./db")
const initSocket = require("./socket")
const envConfig = require("./configs/envConfig")

const start = async () => {
    try {
        await connectMongoDb()
        console.log("Connect MongoDb successfully")

        await redisClient.connect()
        console.log("Connect Redis successfully")

        const server = app.listen(
            envConfig.PORT,
            console.log("🧙‍ Server is running on port " + envConfig.PORT),
        )

        initSocket(server)
    } catch (error) {
        console.log(error)
    }
}

start()
