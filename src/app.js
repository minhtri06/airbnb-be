require("express-async-errors")

const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const logger = require("morgan")
const passport = require("passport")

const envConfig = require("./configs/envConfig")
const { jwtStrategy, googleStrategy } = require("./configs/authStrategies")
const { STATIC_DIRNAME } = require("./constants")
const {
    generalMiddlewares: { handleException, handleNotFound },
} = require("./middlewares")
const router = require("./routes")

const app = express()

app.use(helmet())

app.use(
    cors({
        origin: envConfig.CLIENT_URL,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    }),
)

app.use(logger("dev"))

app.use(express.json())
app.use(
    express.urlencoded({
        extended: true,
    }),
)

app.use(passport.initialize())
passport.use("jwt", jwtStrategy)
passport.use(googleStrategy)

app.use("/api/v1", router)
app.get("/", (req, res) => res.send("oke"))

app.use(express.static(STATIC_DIRNAME))

app.use(handleNotFound)
app.use(handleException)

module.exports = app
