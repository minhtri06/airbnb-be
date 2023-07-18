const moment = require("moment")
const mongoose = require("mongoose")

const { District, Province, User, Property, Booking, Review } = require("../models")
const { bookingService, userService, reviewService } = require("../services")
const { connectMongoDb, redisClient } = require("../db")

const provinces = require("../../crawl-data/divisions/provinces.json")

// Helpers
const pickRandElementFromArr = (array) => array[Math.floor(Math.random() * array.length)]

const genRandNum = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)

const genCBDates = (n) => {
    let bookIn
    let bookOut = moment()
    const currentBookingDates = []
    for (let i = 0; i < n; i++) {
        bookIn = moment(bookOut).add(genRandNum(3, 5), "days")
        bookOut = moment(bookIn).add(genRandNum(2, 4), "days")
        currentBookingDates.push({ bookIn, bookOut })
    }
    return currentBookingDates
}

const genArr = (len, elementGenerator) => {
    const arr = []
    for (let i = 0; i < len; i++) {
        arr.push(elementGenerator())
    }
    return arr
}

const genReviews = (numOfReviews, users, propertyId) => {
    const reviewSamples = [
        "Khá tốt cho gia đình",
        "Good",
        "Kì nghỉ tuyệt vời",
        "Tôi khá thích lò sưởi ở đây",
        "Nhân viên không thân thiện lắm",
        "Thoải mái cho một chuyến công tác",
        "Thank You! For Supporting me during my working time. I will recommend to other friends",
        "Chủ nhà khó khăn, hay chửi khách",
        " wonderful. Beautiful house",
        "Far from the center and the road is a bit difficult",
        "Stable and good for the price spent with all amenities",
    ]
    const reviews = []
    for (let i = 0; i < numOfReviews; i++) {
        reviews.push({
            reviewer: pickRandElementFromArr(users)._id,
            score: Math.round(genRandNum(7, 10)),
            property: propertyId,
            body: pickRandElementFromArr(reviewSamples),
        })
    }
    return reviews
}

// Seeders
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

const seedUsers = async () => {
    const users = [
        {
            name: "Minh Tri",
            email: "pmtri.admin@email.com",
            password: "pmtri123",
            role: "admin",
            dateOfBirth: "2001/01/06",
            gender: "Male",
            isEmailVerified: true,
        },
        {
            name: "Ngo Toai",
            email: "ngotoai.admin@email.com",
            password: "ngotoai123",
            role: "admin",
            dateOfBirth: "2001/01/06",
            gender: "Male",
            isEmailVerified: true,
        },
        {
            name: "Tuan Rose",
            email: "tuanrose.admin@email.com",
            password: "tuanrose123",
            role: "admin",
            dateOfBirth: "2001/01/06",
            gender: "Male",
            isEmailVerified: true,
        },
        {
            name: "Nguyen Anh Khoa",
            email: "anhkhoa@email.com",
            password: "password123",
            role: "normal-user",
            dateOfBirth: "2001/01/06",
            gender: "Male",
            avatar: "/static/img/2.jpg",
            isEmailVerified: true,
        },
        {
            name: "Pham Hong Nhan",
            email: "hongnhan@email.com",
            password: "hongnhan123",
            role: "normal-user",
            dateOfBirth: "2001/01/06",
            gender: "female",
            avatar: "/static/img/3.jpg",
            isEmailVerified: true,
        },
        {
            name: "Tuan Rose",
            email: "tuanrose@email.com",
            password: "tuanrose123",
            role: "normal-user",
            dateOfBirth: "2001/01/06",
            gender: "Male",
            avatar: "/static/img/4.jpg",
            isEmailVerified: true,
        },
        {
            name: "Minh Tri",
            email: "pmtri@email.com",
            password: "pmtri123",
            role: "normal-user",
            dateOfBirth: "2001/01/06",
            gender: "Male",
            avatar: "/static/img/5.jpg",
            isEmailVerified: true,
        },
        {
            name: "Ngo Toai",
            email: "ngotoai@email.com",
            password: "ngotoai123",
            role: "normal-user",
            dateOfBirth: "2001/01/06",
            gender: "Male",
            avatar: "/static/img/1.jpg",
            isEmailVerified: true,
        },
        {
            name: "Bui Thi Lien Hoan",
            email: "lienhoan@email.com",
            password: "lienhoan123",
            role: "normal-user",
            dateOfBirth: "2001/01/06",
            gender: "female",
            avatar: "/static/img/6.jpg",
            isEmailVerified: true,
        },
        {
            name: "Pham Ngoc Long",
            email: "ngoclong@email.com",
            password: "ngoclong123",
            role: "normal-user",
            dateOfBirth: "2001/01/06",
            gender: "female",
            avatar: "/static/img/7.jpg",
            isEmailVerified: true,
        },
        {
            name: "Nguyen Trong Hoan",
            email: "tronghoan@email.com",
            password: "tronghoan123",
            role: "normal-user",
            dateOfBirth: "2001/01/06",
            gender: "Male",
            avatar: "/static/img/8.jpg",
            isEmailVerified: true,
        },
        {
            name: "Huynh Nhat Quoc Bao",
            email: "qbspirit@email.com",
            password: "qbspirit123",
            role: "normal-user",
            dateOfBirth: "2001/01/06",
            gender: "Male",
            avatar: "/static/img/9.jpg",
            isEmailVerified: true,
        },
        {
            name: "Nguyen Quang Nhut",
            email: "aquazuri@email.com",
            password: "aquazuri123",
            role: "normal-user",
            dateOfBirth: "2001/01/06",
            gender: "Male",
            avatar: "/static/img/10.jpg",
            isEmailVerified: true,
        },
    ]
    for (let user of users) {
        await userService.createUser(user)
    }
}

const seedProperty = async () => {
    const users = await User.find()
    if (users.length === 0) {
        return
    }
    const accomTypesAndTitles = {
        "specific-room": [
            "Standard room",
            "Cozy room",
            "Two-bed room",
            "Double room",
            "Standard double room",
        ],
        "entire-house": [
            "Japaneses-style",
            "Standard apartment",
            "Christmas Villas",
            "Cozy apartment",
        ],
    }
    const bedSamples = genArr(10, () => ({
        double: genRandNum(0, 2),
        queen: genRandNum(0, 2),
        single: genRandNum(0, 2),
        sofaBed: genRandNum(0, 2),
    }))
    const locationInfo = {
        daLat: {
            dataFilePath: "../../crawl-data/hotel-data/da-lat-hotels.json",
            address: {
                address: "48, Nguyen Thi Minh Khai",
                district: (await District.findOne({ code: 672 }))._id,
                province: (await District.findOne({ code: 672 })).province,
            },
        },
        binhThuan: {
            dataFilePath: "../../crawl-data/hotel-data/binh-thuan-hotels.json",
            address: {
                address: "Bo bien Tuoi Sang",
                district: (await District.findOne({ provinceCode: 60 }))._id,
                province: (await Province.findOne({ code: 60 }))._id,
            },
        },
        daNang: {
            dataFilePath: "../../crawl-data/hotel-data/da-nang-hotels.json",
            address: {
                address: "Bo bien Buoi Sang",
                district: (await District.findOne({ provinceCode: 48 }))._id,
                province: (await Province.findOne({ code: 48 }))._id,
            },
        },
        haNoi: {
            dataFilePath: "../../crawl-data/hotel-data/ha-noi-hotels.json",
            address: {
                address: "Bo bien Buoi Sang",
                district: (await District.findOne({ provinceCode: 1 }))._id,
                province: (await Province.findOne({ code: 1 }))._id,
            },
        },
        hcm: {
            dataFilePath: "../../crawl-data/hotel-data/ho-chi-minh-hotels.json",
            address: {
                address: "Bo bien Buoi Sang",
                district: (await District.findOne({ provinceCode: 79 }))._id,
                province: (await Province.findOne({ code: 79 }))._id,
            },
        },
    }
    for (let l of Object.values(locationInfo)) {
        const propertiesData = require(l.dataFilePath)
        await Promise.all(
            propertiesData.map((propertyData) => {
                propertyData.owner = pickRandElementFromArr(users)._id
                propertyData.address = l.address
                propertyData.accommodations = genArr(genRandNum(0, 3), () => {
                    const accommodation = {}
                    const type = pickRandElementFromArr(Object.keys(accomTypesAndTitles))
                    if (type === "specific-room") {
                        accommodation.bed = pickRandElementFromArr(bedSamples)
                    } else {
                        accommodation.rooms = genArr(genRandNum(1, 4), () => ({
                            bed: pickRandElementFromArr(bedSamples),
                        }))
                    }
                    accommodation.type = type
                    accommodation.title = pickRandElementFromArr(
                        accomTypesAndTitles[type],
                    )
                    accommodation.pricePerNight = genRandNum(15, 100)
                    accommodation.maximumOfGuests = genRandNum(1, 4)
                    return accommodation
                })
                const property = new Property(propertyData)
                property.score = null
                property.sumScore = 0
                property.reviewCount = 0
                return property.save()
            }),
        )
    }
}

const seedBooking = async () => {
    const users = await User.find()
    if (users.length === 0) {
        return
    }
    const properties = await Property.find()
    for (let property of properties) {
        for (let accom of property.accommodations) {
            const currentBookingDates = genCBDates(genRandNum(0, 3))
            for (let cbd of currentBookingDates) {
                await bookingService.createBooking({
                    ...cbd,
                    property: property._id,
                    guest: pickRandElementFromArr(users),
                    accomId: accom._id,
                })
            }
        }
    }
}

const seedReviews = async () => {
    const users = await User.find()
    if (users.length === 0) {
        return
    }
    const properties = await Property.find()
    if (properties.length === 0) {
        return
    }

    for (let property of properties) {
        const reviews = genReviews(genRandNum(0, 20), users, property._id)
        if (reviews.length === 0) {
            continue
        }
        await Promise.all(reviews.map((review) => reviewService.createReview(review)))
    }
}

const truncateData = async () => {
    await Promise.all([
        District.deleteMany(),
        Province.deleteMany(),
        User.deleteMany(),
        Property.deleteMany(),
        Booking.deleteMany(),
        Review.deleteMany(),
    ])
}

// Run seed
connectMongoDb().then(async () => {
    await redisClient.connect()
    await truncateData()
    await seedDivisions()
    await seedUsers()
    await seedProperty()
    await seedBooking()
    await seedReviews()
    console.log("Done")
    await redisClient.quit()
    await mongoose.connection.close()
})
