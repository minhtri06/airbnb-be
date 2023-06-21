const mongoose = require("mongoose")

const {
    mongodb: { URL, DB_NAME },
} = require("../configs/envConfig")

const connectMongoDb = async () => {
    await mongoose.connect(URL, { dbName: DB_NAME })
}

module.exports = connectMongoDb
