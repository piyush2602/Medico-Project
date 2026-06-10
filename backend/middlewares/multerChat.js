import multer from 'multer'

const storage = multer.diskStorage({
    filename: function(req, file, callback){
        callback(null, file.originalname)
    }
})

// Max size 5MB
const maxSize = 5 * 1024 * 1024

const uploadChat = multer({
    storage,
    limits: { fileSize: maxSize },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
            cb(null, true)
        } else {
            cb(new Error('Only images and PDFs are allowed!'))
        }
    }
})

export default uploadChat
