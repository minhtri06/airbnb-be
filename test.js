const { connectMongoDb } = require("./src/db")
const { User } = require("./src/models")

connectMongoDb().then(async () => {
    const user = new User({
        address: {
            address: "48 Nguyen Thi Minh Khai",
            district: "64874afec6293895ea5f61f5",
            province: {
                name: "Hà Nội",
                divisionType: "thành phố trung ương",
                code: 1,
                id: "64874afec6293895ea5f61f5",
            },
        },
        name: "Minh Tri",
        email: "4213@email.com",
        authType: "local",
        id: "6492e6899f642820bf4ada64",
    })
    console.log(user)
})
