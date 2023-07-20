module.exports = {
    bookingMiddleware: require("./booking.middleware"),
    propertyMiddleware: require("./property.middleware"),
    reviewMiddleware: require("./review.middleware"),
    generalMiddlewares: {
        auth: require("./general/auth"),
        handleException: require("./general/handleException"),
        handleNotFound: require("./general/handleNotFound"),
        upload: require("./upload"),
        validate: require("./validate"),
    },
}
