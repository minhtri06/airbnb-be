const commonConstants = {
    nodeEnv: {
        DEVELOPMENT: "development",
        PRODUCTION: "production",
        TEST: "test",
    },
    tokenTypes: {
        ACCESS: "access",
        REFRESH: "refresh",
    },
    request: {
        BODY: "body",
        PARAMS: "params",
        QUERY: "query",
        FILE: "file",
    },
    authTypes: {
        LOCAL: "local",
        GOOGLE: "google",
    },
    STATIC_DIRNAME: process.cwd() + "/src/static",
    genders: {
        MALE: "male",
        FEMALE: "female",
    },
    accommodationGroupTypes: {
        ENTIRE_HOUSE: "entire-house",
        SPECIFIC_ROOM: "specific-room",
    },
    accommodationTypes: {
        ONE_ROOM: "one-room",
        MULTI_ROOMS: "multi-rooms",
    },
}

module.exports = commonConstants
