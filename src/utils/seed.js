const moment = require("moment")
const mongoose = require("mongoose")
const envConfig = require("../configs/envConfig")

const {
    District,
    Province,
    User,
    Property,
    Booking,
    Review,
    Token,
    PropertyScoreChange,
} = require("../models")
const {
    bookingService,
    userService,
    reviewService,
    scheduleService,
} = require("../services")
const { connectMongoDb } = require("../db")

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
        "We had a wonderful stay. The room and the property were well taken care of and communication was easy. Da met us at check in and everything went really smoothly. We would definitely stay again next time were in the area. We really enjoyed the area and found lots of good places to relax and eat near the room.",
        "Good",
        "This is a great place in an amazing suburb full of craft markets, cafes, restaurants. It’s lovely to wander around. The place is very well equipped, with a nice pool and helpfully washing machine and Ada was very helpful. Would highly recommend a stay, it’s a lovely area so a little noisy at night is my only comment (but worth it for the rest!)",
        "Tôi khá thích lò sưởi ở đây",
        "Nhân viên không thân thiện lắm",
        "Thoải mái cho một chuyến công tác",
        "Thank You! For Supporting me during my working time. I will recommend to other friends",
        "Chủ nhà khó khăn, hay chửi khách",
        " wonderful. Beautiful house",
        "Far from the center and the road is a bit difficult",
        "Stable and good for the price spent with all amenities",
        "great stay.. highly recommend!",
        "We really enjoyed our stay at Jitrada's place. It's a very cosy house at a peaceful and quiet place.\nJitrada answered very fast and helped us with all our questions. She is really a very lovely host.",
        "All was great, very authentic house. Highly recommended!",
        "Very nice, quite and clean place. Enjoyable and easy to find, Taxi can go directly in front of the house. Jitrada is a responsible and friendly host, she is always ready to help, and good at commutation. Highly recommended place.",
        "I’ve stayed at 100s of Airbnbs and Nathan was one the most welcoming hosts. Incredible home and highly recommended. \nThe Airbnb is a ~10 minute walk to the beach and I would suggest using a motorcycle or scooter rental if you’re comfortable riding. Although be warned that the traffic, anywhere in Vietnam, is not for the faint of heart.\nAnyways, thanks for the stay!! We would love to visit again some day",
        "Clean and spacious place. Had a comfortable stay and Nathan was really friendly! Highly recommend :)",
        "Super friendly & helpful host. Nathan’s place is clean and look the same as advertised. Asked Nathan for food recommendations and he responded promptly with a few local restaurants within the neighbourhood. Looking forward to my next visit to Da Nang!! Thanks Nathan 🤎 sending you love from Malaysia",
        "친절하고 빠르게 안내해주시고 숙소가 넓어서 좋았습니다! 또 놀러올게요",
        "위치도 좋고 무엇보다 호스트와의 연락이 빠르게 이루어져서 너무 좋았습니다.ᐟ",
        "Ok",
        "Yolo",
        "Bright, comfortable house, in a great area. Responsive owner, transferred the check-in, to an earlier time;)",
        "Very clean and comfortable place, very accommodating host",
        "place is in abit of a forested area so there are many insects bring some form of repellent along",
        "We had a great time at sams place. Would recommend to anyone who was some peace and quiet",
        "great place to visit, staff is very friendly and support. thank you for good exp :)",
        "Great place if travel in group, especially families with young explorers. Room is as good as pictures nice cozy bunk beds.",
        "I spent 2 nights here with wonderful feeling. In Dalat city, we rarely find a place like this with full facilities, close to the nature but not too far from the city, only 10 min driving and easy to explore the short track to Da Phu hill as well.",
        "Amazing host, very kind and welcoming. staff was extremely kind and everything was very clean.\nThe view is stunning couldnt recommend more.",
        "I had an absolutely fantastic experience during my stay at this Airbnb! It was a dream come true to be surrounded by nature and have the opportunity to live amidst its beauty, all while enjoying a clean and comfortable room with access to clean water. This place truly had everything I needed and more.\nThe highlight of my stay was undoubtedly the exhilarating ATV ride. Exploring the picturesque mountains and trails on the ATV was an adventure like no other. The thrill and excitement of riding through the stunning landscape were unforgettable. I must commend the host, Sam, and his staff for their excellent guidance and support throughout the ATV experience. They made sure I had a safe and enjoyable time.\nAlthough I didn't have the chance to try the dirt biking or enjoy a campfire, I could see that these options were available.\nThis is the perfect destination for an extraordinary getaway that will leave you with incredible memories",
        "The place is clean and nice, peaceful place to stay and cheap price for the room if you go from 3-4 people. But I had a bit problem with located the villa from map direction. The staffs and Sam are quite friendly and delicate.\nI highly recommend for someone who wants a peaceful place to stay away from your hustle life.",
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

const propertyCategoryCodes = [
    "iconic-cities",
    "countryside",
    "omg",
    "rooms",
    "beach",
    "amazing-views",
    "mansions",
    "amazing-pools",
    "tiny-homes",
    "riads",
    "beachfront",
    "casas-particulares",
    "towers",
    "treehouses",
    "lakefront",
    "domes",
    "cabins",
    "earth-homes",
    "national-parks",
    "design",
    "tropical",
    "camping",
    "farms",
    "creative-spaces",
    "top-of-the-world",
    "trending",
    "luxe",
    "lake",
    "shepherd's-huts",
    "new",
    "castles",
    "skiing",
    "chef's-kitchens",
    "islands",
    "surfing",
    "play",
    "arctic",
    "boats",
    "vineyards",
    "bed-breakfasts",
    "campers",
    "a-frames",
    "caves",
    "golfing",
    "historical-homes",
    "hanoks",
    "cycladic-homes",
    "ryokans",
    "windmills",
    "houseboats",
    "minsus",
    "desert",
    "barns",
    "yurts",
    "off-the-grid",
    "adapted",
    "ski-in/out",
    "containers",
    "grand-pianos",
    "dammusi",
    "trulli",
]

// Seeders
const seedDivisions = async () => {
    for (let province of provinces) {
        const provinceDoc = await Province.create({
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
                    province: provinceDoc._id,
                    latitude: district.latitude,
                    longitude: district.longitude,
                }
            }),
        )
    }
}

const seedUsers = async () => {
    const usersData = [
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
            avatar: "/img/2.jpg",
            isEmailVerified: true,
        },
        {
            name: "Pham Hong Nhan",
            email: "hongnhan@email.com",
            password: "hongnhan123",
            role: "normal-user",
            dateOfBirth: "2001/01/06",
            gender: "female",
            avatar: "/img/3.jpg",
            isEmailVerified: true,
        },
        {
            name: "Tuan Rose",
            email: "tuanrose@email.com",
            password: "tuanrose123",
            role: "normal-user",
            dateOfBirth: "2001/01/06",
            gender: "Male",
            avatar: "/img/4.jpg",
            isEmailVerified: true,
        },
        {
            name: "Minh Tri",
            email: "pmtri@email.com",
            password: "pmtri123",
            role: "normal-user",
            dateOfBirth: "2001/01/06",
            gender: "Male",
            avatar: "/img/5.jpg",
            isEmailVerified: true,
        },
        {
            name: "Ngo Toai",
            email: "ngotoai@email.com",
            password: "ngotoai123",
            role: "normal-user",
            dateOfBirth: "2001/01/06",
            gender: "Male",
            avatar: "/img/1.jpg",
            isEmailVerified: true,
        },
        {
            name: "Bui Thi Lien Hoan",
            email: "lienhoan@email.com",
            password: "lienhoan123",
            role: "normal-user",
            dateOfBirth: "2001/01/06",
            gender: "female",
            avatar: "/img/6.png",
            isEmailVerified: true,
        },
        {
            name: "Pham Ngoc Long",
            email: "ngoclong@email.com",
            password: "ngoclong123",
            role: "normal-user",
            dateOfBirth: "2001/01/06",
            gender: "female",
            avatar: "/img/7.jpg",
            isEmailVerified: true,
        },
        {
            name: "Nguyen Trong Hoan",
            email: "tronghoan@email.com",
            password: "tronghoan123",
            role: "normal-user",
            dateOfBirth: "2001/01/06",
            gender: "Male",
            avatar: "/img/8.png",
            isEmailVerified: true,
        },
        {
            name: "Huynh Nhat Quoc Bao",
            email: "qbspirit@email.com",
            password: "qbspirit123",
            role: "normal-user",
            dateOfBirth: "2001/01/06",
            gender: "Male",
            avatar: "/img/9.png",
            isEmailVerified: true,
        },
        {
            name: "Nguyen Quang Nhut",
            email: "aquazuri@email.com",
            password: "aquazuri123",
            role: "normal-user",
            dateOfBirth: "2001/01/06",
            gender: "Male",
            avatar: "/img/10.png",
            isEmailVerified: true,
        },
    ]
    await Promise.all(usersData.map((userData) => userService.createUser(userData)))
    await User.updateMany({}, { $set: { isEmailVerified: true } })
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
                propertyData.address.longitude = propertyData.longitude
                propertyData.address.latitude = propertyData.latitude
                propertyData.accommodations = genArr(genRandNum(1, 3), () => {
                    const accommodation = {}
                    const type = pickRandElementFromArr(Object.keys(accomTypesAndTitles))
                    accommodation.bed = pickRandElementFromArr(bedSamples)
                    if (type === "entire-house") {
                        accommodation.numberOfRooms = genRandNum(1, 4)
                    }
                    accommodation.type = type
                    accommodation.title = pickRandElementFromArr(
                        accomTypesAndTitles[type],
                    )
                    accommodation.pricePerNight = genRandNum(15, 100)
                    accommodation.maximumOfGuests = genRandNum(1, 4)
                    return accommodation
                })
                propertyData.categoryCodes = [
                    pickRandElementFromArr(propertyCategoryCodes),
                    pickRandElementFromArr(propertyCategoryCodes),
                    pickRandElementFromArr(propertyCategoryCodes),
                    pickRandElementFromArr(propertyCategoryCodes),
                    pickRandElementFromArr(propertyCategoryCodes),
                    pickRandElementFromArr(propertyCategoryCodes),
                    pickRandElementFromArr(propertyCategoryCodes),
                    pickRandElementFromArr(propertyCategoryCodes),
                    pickRandElementFromArr(propertyCategoryCodes),
                    pickRandElementFromArr(propertyCategoryCodes),
                    pickRandElementFromArr(propertyCategoryCodes),
                    pickRandElementFromArr(propertyCategoryCodes),
                    pickRandElementFromArr(propertyCategoryCodes),
                    pickRandElementFromArr(propertyCategoryCodes),
                    pickRandElementFromArr(propertyCategoryCodes),
                    pickRandElementFromArr(propertyCategoryCodes),
                    pickRandElementFromArr(propertyCategoryCodes),
                ]
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
        const reviews = genReviews(genRandNum(3, 30), users, property._id)
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
        Token.deleteMany(),
        PropertyScoreChange.deleteMany(),
    ])
}

// Run seed
connectMongoDb().then(async () => {
    console.log("🍂 Seed start")
    await truncateData()
    await seedDivisions()
    await seedUsers()
    await seedProperty()
    await seedBooking()
    await seedReviews()
    await scheduleService.removeOutdatedCurrentBookingDates()
    await scheduleService.updatePropertyScore()
    console.log("🍂 Seed done")
    await mongoose.connection.close()
})
