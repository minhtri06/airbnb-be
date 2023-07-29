require("express-async-errors")

const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const logger = require("morgan")
const passport = require("passport")

const envConfig = require("./configs/envConfig")
const { jwtStrategy } = require("./configs/authStrategies")
const { STATIC_DIRNAME } = require("./constants")
const {
    generalMiddlewares: { handleException, handleNotFound },
} = require("./middlewares")
const router = require("./routes")

const app = express()

app.use(helmet())

app.use(cors())

app.use(logger("dev"))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(express.static(STATIC_DIRNAME))

app.use(passport.initialize())
passport.use("jwt", jwtStrategy)

app.use(envConfig.API_PREFIX, router)
app.get("/", (req, res) => res.sendFile(STATIC_DIRNAME + "/views/home.html"))

app.use(handleNotFound)
app.use(handleException)

module.exports = app
