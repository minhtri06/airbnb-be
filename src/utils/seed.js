const { District, Province, User } = require("../models")
const { connectMongoDb } = require("../db")

const provinces = require("../../crawl-data/divisions/provinces.json")

const seedDivisions = async () => {
    for (let province of provinces) {
        const provinceObj = await Province.create({
            name: province.name,
            divisionType: province.division_type,
            code: province.code,
        })
        await District.insertMany(
            province.districts.map((district) => {
                return {
                    name: district.name,
                    divisionType: district.division_type,
                    code: district.code,
                    provinceCode: district.province_code,
                    province: provinceObj._id,
                }
            }),
        )
    }
}

const seedUsers = () => {
    User.create({
        name: "Minh Tri",
        email: "pmtri.admin@email.com",
        password: "pmtri123",
        roles: ["admin"],
        dateOfBirth: "2001/01/06",
        gender: "Male",
    })
    User.create({
        name: "Ngo Toai",
        email: "ngotoai.admin@email.com",
        password: "ngotoai123",
        roles: ["admin"],
        dateOfBirth: "2001/01/06",
        gender: "Male",
    })
    User.create({
        name: "Tuan Rose",
        email: "tuanrose.admin@email.com",
        password: "tuanrose123",
        roles: ["admin"],
        dateOfBirth: "2001/01/06",
        gender: "Male",
    })

    User.create({
        name: "Nguyen Anh Khoa",
        email: "anhkhoa@email.com",
        password: "password123",
        roles: ["normal-user"],
        dateOfBirth: "2001/01/06",
        gender: "Male",
        avatar: "/static/img/2.jpg",
    })
    User.create({
        name: "Pham Hong Nhan",
        email: "hongnhan@email.com",
        password: "hongnhan123",
        roles: ["normal-user"],
        dateOfBirth: "2001/01/06",
        gender: "female",
        avatar: "/static/img/3.jpg",
    })
    User.create({
        name: "Tuan Rose",
        email: "tuanrose@email.com",
        password: "tuanrose123",
        roles: ["normal-user"],
        dateOfBirth: "2001/01/06",
        gender: "Male",
        avatar: "/static/img/4.jpg",
    })
    User.create({
        name: "Minh Tri",
        email: "pmtri@email.com",
        password: "pmtri123",
        roles: ["normal-user"],
        dateOfBirth: "2001/01/06",
        gender: "Male",
        avatar: "/static/img/5.jpg",
    })
    User.create({
        name: "Ngo Toai",
        email: "ngotoai@email.com",
        password: "ngotoai123",
        roles: ["normal-user"],
        dateOfBirth: "2001/01/06",
        gender: "Male",
        avatar: "/static/img/1.jpg",
    })
    User.create({
        name: "Bui Thi Lien Hoan",
        email: "lienhoan@email.com",
        password: "lienhoan123",
        roles: ["normal-user"],
        dateOfBirth: "2001/01/06",
        gender: "female",
        avatar: "/static/img/6.jpg",
    })
    User.create({
        name: "Pham Ngoc Long",
        email: "ngoclong@email.com",
        password: "ngoclong123",
        roles: ["normal-user"],
        dateOfBirth: "2001/01/06",
        gender: "female",
        avatar: "/static/img/7.jpg",
    })
    User.create({
        name: "Nguyen Trong Hoan",
        email: "tronghoan@email.com",
        password: "tronghoan123",
        roles: ["normal-user"],
        dateOfBirth: "2001/01/06",
        gender: "Male",
        avatar: "/static/img/8.jpg",
    })
    User.create({
        name: "Huynh Nhat Quoc Bao",
        email: "qbspirit@email.com",
        password: "qbspirit123",
        roles: ["normal-user"],
        dateOfBirth: "2001/01/06",
        gender: "Male",
        avatar: "/static/img/9.jpg",
    })
    User.create({
        name: "Nguyen Quang Nhut",
        email: "aquazuri@email.com",
        password: "aquazuri123",
        roles: ["normal-user"],
        dateOfBirth: "2001/01/06",
        gender: "Male",
        avatar: "/static/img/10.jpg",
    })
}

connectMongoDb().then(() => {
    seedDivisions()
    seedUsers()
})
