const moment = require("moment")
const mongoose = require("mongoose")

const { District, Province, User, Property, Booking, Review } = require("../models")
const { bookingService } = require("../services")
const { connectMongoDb, redisClient } = require("../db")

const provinces = require("../../crawl-data/divisions/provinces.json")

// Helpers
const getRandomElementInArray = (array) => array[Math.floor(Math.random() * array.length)]

const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)

const generateCurrentBookingDates = (n, users) => {
    let bookIn
    let bookOut = moment()
    const currentBookingDates = []
    for (let i = 0; i < n; i++) {
        bookIn = moment(bookOut).add(getRandomNumber(3, 5), "days")
        bookOut = moment(bookIn).add(getRandomNumber(2, 4), "days")
        currentBookingDates.push({
            bookIn,
            bookOut,
            guest: getRandomElementInArray(users)._id,
        })
    }
    return currentBookingDates
}

const generateReviews = (numOfReviews, users, propertyId) => {
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
            reviewer: getRandomElementInArray(users)._id,
            score: Math.round(getRandomNumber(7, 10)),
            property: propertyId,
            body: getRandomElementInArray(reviewSamples),
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
    await Promise.all([
        User.create({
            name: "Minh Tri",
            email: "pmtri.admin@email.com",
            password: "pmtri123",
            roles: ["admin"],
            dateOfBirth: "2001/01/06",
            gender: "Male",
        }),
        User.create({
            name: "Ngo Toai",
            email: "ngotoai.admin@email.com",
            password: "ngotoai123",
            roles: ["admin"],
            dateOfBirth: "2001/01/06",
            gender: "Male",
        }),
        User.create({
            name: "Tuan Rose",
            email: "tuanrose.admin@email.com",
            password: "tuanrose123",
            roles: ["admin"],
            dateOfBirth: "2001/01/06",
            gender: "Male",
        }),
        User.create({
            name: "Nguyen Anh Khoa",
            email: "anhkhoa@email.com",
            password: "password123",
            roles: ["normal-user"],
            dateOfBirth: "2001/01/06",
            gender: "Male",
            avatar: "/static/img/2.jpg",
        }),
        User.create({
            name: "Pham Hong Nhan",
            email: "hongnhan@email.com",
            password: "hongnhan123",
            roles: ["normal-user"],
            dateOfBirth: "2001/01/06",
            gender: "female",
            avatar: "/static/img/3.jpg",
        }),
        User.create({
            name: "Tuan Rose",
            email: "tuanrose@email.com",
            password: "tuanrose123",
            roles: ["normal-user"],
            dateOfBirth: "2001/01/06",
            gender: "Male",
            avatar: "/static/img/4.jpg",
        }),
        User.create({
            name: "Minh Tri",
            email: "pmtri@email.com",
            password: "pmtri123",
            roles: ["normal-user"],
            dateOfBirth: "2001/01/06",
            gender: "Male",
            avatar: "/static/img/5.jpg",
        }),
        User.create({
            name: "Ngo Toai",
            email: "ngotoai@email.com",
            password: "ngotoai123",
            roles: ["normal-user"],
            dateOfBirth: "2001/01/06",
            gender: "Male",
            avatar: "/static/img/1.jpg",
        }),
        User.create({
            name: "Bui Thi Lien Hoan",
            email: "lienhoan@email.com",
            password: "lienhoan123",
            roles: ["normal-user"],
            dateOfBirth: "2001/01/06",
            gender: "female",
            avatar: "/static/img/6.jpg",
        }),
        User.create({
            name: "Pham Ngoc Long",
            email: "ngoclong@email.com",
            password: "ngoclong123",
            roles: ["normal-user"],
            dateOfBirth: "2001/01/06",
            gender: "female",
            avatar: "/static/img/7.jpg",
        }),
        User.create({
            name: "Nguyen Trong Hoan",
            email: "tronghoan@email.com",
            password: "tronghoan123",
            roles: ["normal-user"],
            dateOfBirth: "2001/01/06",
            gender: "Male",
            avatar: "/static/img/8.jpg",
        }),
        User.create({
            name: "Huynh Nhat Quoc Bao",
            email: "qbspirit@email.com",
            password: "qbspirit123",
            roles: ["normal-user"],
            dateOfBirth: "2001/01/06",
            gender: "Male",
            avatar: "/static/img/9.jpg",
        }),
        User.create({
            name: "Nguyen Quang Nhut",
            email: "aquazuri@email.com",
            password: "aquazuri123",
            roles: ["normal-user"],
            dateOfBirth: "2001/01/06",
            gender: "Male",
            avatar: "/static/img/10.jpg",
        }),
    ])
}

const seedProperty = async () => {
    const users = await User.find()
    if (users.length === 0) {
        return
    }
    const accommodationGroupTitles = [
        "Standard Room",
        "Vip Room",
        "Family Room",
        "Two-bed Room",
        "Japaneses-Style",
        "Double Room",
        "Standard Double Room",
    ]
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
                propertyData.owner = getRandomElementInArray(users)._id
                propertyData.address = l.address
                propertyData.accommodationGroups = [
                    {
                        title: getRandomElementInArray(accommodationGroupTitles),
                        pricePerNight: getRandomNumber(10, 100) * 10000,
                        type: "specific-room",
                        bedType: "Single Bed",
                        accommodations: [{ roomCode: "AA1" }, { roomCode: "AA2" }],
                    },
                ]
                const property = new Property(propertyData)
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
        if (!property.accommodationGroups) {
            continue
        }
        for (let accomGroup of property.accommodationGroups) {
            for (let accom of accomGroup.accommodations) {
                const currentBookingDates = generateCurrentBookingDates(
                    getRandomNumber(0, 3),
                    users,
                )
                for (let cbd of currentBookingDates) {
                    const booking = await bookingService.createBooking({
                        ...cbd,
                        property: property._id,
                        accomGroupId: accomGroup._id,
                    })
                    await bookingService.approveBookingToAccom(booking, accom._id)
                }
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
        const reviews = generateReviews(getRandomNumber(0, 4), users, property._id)
        if (reviews.length === 0) {
            continue
        }
        const averageScore =
            reviews.reduce((sum, review) => sum + review.score, 0) / reviews.length
        property.score = averageScore
        property.reviewCount = reviews.length
        await Review.insertMany(reviews)
        await property.save()
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
