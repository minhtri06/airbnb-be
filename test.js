const { connectMongoDb } = require("./src/db")
const { Property, User } = require("./src/models")
const moment = require("moment")

// connectMongoDb().then(async () => {
//     const uCursor = User.where().cursor()
//     for (let user = await uCursor.next(); user !== null; user = await uCursor.next()) {
//         console.log(user)
//     }
// })

const getRandomElementInArray = (array) => array[Math.floor(Math.random() * array.length)]
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)
const generateCurrentBookingDates = (n) => {
    let bookIn
    let bookOut = moment()
    const currentBookingDates = []
    for (let i = 0; i < n; i++) {
        bookIn = bookOut.add(getRandomNumber(3, 5), "days")
        bookOut = bookIn.add(getRandomNumber(2, 4), "days")
        currentBookingDates.push({
            bookIn: bookIn.calendar(),
            bookOut: bookOut.calendar(),
        })
    }
    return currentBookingDates
}

console.log(generateCurrentBookingDates(3))
