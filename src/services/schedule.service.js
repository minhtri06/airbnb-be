const schedule = require("node-schedule")

const { Property, PropertyScoreChange } = require("../models")

const updatePropertyScore = async () => {
    const aggregations = await PropertyScoreChange.aggregate([
        {
            $group: {
                _id: "$property",
                sum: { $sum: "$scoreChange" },
                count: { $count: {} },
            },
        },
    ])
    for (let agg of aggregations) {
        const property = await Property.findById(agg._id)
        const newReviewCount = property.reviewCount + agg.count
        const newSumScore = property.sumScore + agg.sum
        let newScore = null
        if (newReviewCount !== 0) {
            newScore = newSumScore / newReviewCount
        }
        property.score
        await Property.updateOne(
            { _id: property._id },
            { score: newScore, sumScore: newSumScore, reviewCount: newReviewCount },
        )
    }
    await PropertyScoreChange.deleteMany({})
}
schedule.scheduleJob("00 00 01 * * *", updatePropertyScore)

const removeOutdatedCurrentBookingDates = async () => {
    const properties = await Property.find().lean()
    const now = new Date()
    for (let p of properties) {
        for (let a of p.accommodations) {
            if (!a.currentBookingDates) continue
            a.currentBookingDates = a.currentBookingDates.filter(
                (cbd) => now < cbd.bookOut,
            )
        }
    }
    await Promise.all(
        properties.map((p) =>
            Property.updateOne(
                { _id: p._id },
                { accommodations: p.accommodations },
            ).exec(),
        ),
    )
}
schedule.scheduleJob("00 00 00 * * *", removeOutdatedCurrentBookingDates)
