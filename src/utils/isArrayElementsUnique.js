const isArrayElementsUnique = (arr) => {
    const arrSet = new Set(arr)
    return arrSet.size === arr.length
}

module.exports = isArrayElementsUnique
