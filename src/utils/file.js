const { promisify } = require("util")
const fs = require("fs")
const { STATIC_DIRNAME } = require("../constants")

const deleteFile = promisify(fs.unlink)

const deleteStaticFile = async (relativePath) => {
    await deleteFile(STATIC_DIRNAME + relativePath)
}

const deleteManyStaticFiles = async (relativePaths) => {
    for (let relativePath of relativePaths) {
        await deleteStaticFile(relativePath)
    }
}

module.exports = {
    deleteFile,
    deleteStaticFile,
    deleteManyStaticFiles,
}
