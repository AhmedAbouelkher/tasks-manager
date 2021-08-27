const multer = require('multer');
const Sharp = require('sharp');

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        try {
            const isImage = file.originalname.match(/\.(png|jpeg|jpg)$/)
            if (!isImage) {
                return cb(new Error("Avatar must be an image"))
            }
            return cb(undefined, true)
        } catch (error) {
            return cb(error)
        }
    }
})

const normalizeImg = async(req, _, next) => {
    const imgBuffer = await Sharp(req.file.buffer)
        .resize(250, 250)
        .png()
        .toBuffer()
    req.user.avatar = imgBuffer
    next()
}

module.exports = {
    upload,
    normalizeImg
}