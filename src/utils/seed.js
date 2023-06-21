const { District, Province } = require("../models")

const provinces = require("../../crawl-data/divisions/provinces.json")

const seed = async () => {
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

console.log("object")
console.log("object")
console.log("object")
console.log("object")
seed()
