import express from 'express'
import multer from 'multer'
import { doctorList, recommendDoctor, analyzeReport, loginDoctor, getDocAppointments, docCancelAppointment, docCompleteAppointment, savePrescription, getDocProfile, getDocChatHistory, uploadDocChatAttachment, eraseChatHistory } from '../controllers/doctorController.js'
import authDoctor from '../middlewares/authDoctor.js'
import uploadChat from '../middlewares/multerChat.js'

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

// Public routes
doctorRouter.get('/list', doctorList)
doctorRouter.post('/recommend', recommendDoctor)
doctorRouter.post('/analyze-report', pdfUpload.single('report'), analyzeReport)
doctorRouter.post('/login', loginDoctor)

// Protected doctor routes (require dtoken header)
doctorRouter.get('/appointments', authDoctor, getDocAppointments)
doctorRouter.post('/cancel-appointment', authDoctor, docCancelAppointment)
doctorRouter.post('/complete-appointment', authDoctor, docCompleteAppointment)
doctorRouter.post('/save-prescription', authDoctor, savePrescription)
doctorRouter.get('/profile', authDoctor, getDocProfile)

// Chat routes
doctorRouter.post('/chat/history', authDoctor, getDocChatHistory)
doctorRouter.post('/chat/upload', authDoctor, uploadChat.single('attachment'), uploadDocChatAttachment)
doctorRouter.post('/chat/erase', authDoctor, eraseChatHistory)

export default doctorRouter
