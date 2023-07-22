module.exports = {
    bookingMiddleware: require("./booking.middleware"),
    chatMiddleware: require("./chat.middleware"),
    propertyMiddleware: require("./property.middleware"),
    reviewMiddleware: require("./review.middleware"),
    generalMiddlewares: {
        auth: require("./general/auth"),
        handleException: require("./general/handleException"),
        handleNotFound: require("./general/handleNotFound"),
        upload: require("./general/upload"),
        validate: require("./general/validate"),
    },
}
