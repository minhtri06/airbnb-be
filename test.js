const { connectMongoDb } = require("./src/db")
const { Property, User } = require("./src/models")
const moment = require("moment")
const Joi = require("joi")

const isAccommodationAvailable = (accom, bookIn, bookOut) => {
    let isAvailable = false
    const cbDates = accom.currentBookingDates
    if (cbDates.length !== 0) {
        console.log(bookIn)
        console.log(cbDates[0].bookOut)
        console.log(bookIn > cbDates[cbDates.length - 1].bookOut)
    }
    if (
        cbDates.length === 0 ||
        bookOut < cbDates[0].bookIn ||
        bookIn > cbDates[cbDates.length - 1].bookOut
    ) {
        isAvailable = true
    } else {
        for (let i = 1; i < cbDates.length; i++) {
            if (bookOut < cbDates[i].bookIn) {
                if (bookIn > cbDates[i - 1].bookOut) {
                    isAvailable = true
                }
                break
            }
        }
    }
    return isAvailable
}

const isPropertyAvailable = (property, bookIn, bookOut) => {
    for (let accomGroup of property.accommodationGroups) {
        for (let accom of accomGroup.accommodations) {
            if (isAccommodationAvailable(accom, bookIn, bookOut)) {
                return true
            }
        }
    }
    return false
}

/**
 * @param {{
 *  accommodationGroups: [{
 *      accommodations
 *  }]
 * }} property
 * @param {InstanceType<Date>} bookIn
 * @param {InstanceType<Date>} bookOut
 */
const addAvailabilityFieldsToProperty = (property, bookIn, bookOut) => {
    property.isAvailable = false
    bookIn = new Date(bookIn)
    bookOut = new Date(bookOut)
    for (let accomGroup of property.accommodationGroups) {
        accomGroup.availableCount = 0

        for (let accom of accomGroup.accommodations) {
            // Check if this accommodation is available
            if (isAccommodationAvailable(accom, bookIn, bookOut)) {
                property.isAvailable = true
                accomGroup.availableCount++
                accom.isAvailable = true
            } else {
                accom.isAvailable = false
            }
        }
    }
}

// connectMongoDb().then(async () => {
//     let property = await Property.findOne({ _id: "6499ba294cf56256943c0833" })
//     property = property.toObject()
//     addAvailabilityFieldsToProperty(property, "2023-06-03", "2023-06-04")
//     console.log(property.accommodationGroups[0].accommodations[1])
// })

const date = new Date("2023-06-05T17:00:00.000Z")
console.log(moment(Joi.date().iso().validate("2023-06-05").value).isSame(date))
console.log(date)
