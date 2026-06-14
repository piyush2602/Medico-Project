import express from 'express'
import { addDoctor, loginAdmin, allDoctors, changeAvailability, appointmentsAdmin, appointmentCancel, appointmentComplete, adminDashboard, sendAdminEmail } from '../controllers/adminController.js'
import upload from '../middlewares/multer.js'
import authAdmin from '../middlewares/authAdmin.js'

const adminRouter = express.Router()

adminRouter.post('/add-doctor', authAdmin, upload.single('image'), addDoctor)
adminRouter.post('/login', loginAdmin)
adminRouter.post('/all-doctors', authAdmin, allDoctors)
adminRouter.post('/change-availability', authAdmin, changeAvailability)
adminRouter.get('/appointments', authAdmin, appointmentsAdmin)
adminRouter.post('/cancel-appointment', authAdmin, appointmentCancel)
adminRouter.post('/complete-appointment', authAdmin, appointmentComplete)
adminRouter.get('/dashboard', authAdmin, adminDashboard)
adminRouter.post('/send-email', authAdmin, sendAdminEmail)



export default adminRouter


