import express from 'express'
import multer from 'multer'
import { doctorList, recommendDoctor, analyzeReport } from '../controllers/doctorController.js'

const doctorRouter = express.Router()

// Memory storage multer for PDF + Image report uploads (10 MB limit)
const pdfUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if (allowed.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new Error('Only PDF and image files (JPG, PNG, WEBP) are allowed'), false)
        }
    }
})

doctorRouter.get('/list', doctorList)
doctorRouter.post('/recommend', recommendDoctor)
doctorRouter.post('/analyze-report', pdfUpload.single('report'), analyzeReport)

export default doctorRouter
