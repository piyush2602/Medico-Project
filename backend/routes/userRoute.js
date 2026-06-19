import express from 'express'
import { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment, deleteAppointment, getChatHistory, uploadChatAttachment, sendEmailToDoctor } from '../controllers/userController.js'
import { chatWithMediBot } from '../controllers/medibotController.js'
import authUser from '../middlewares/authUser.js'
import upload from '../middlewares/multer.js'
import uploadChat from '../middlewares/multerChat.js'

const userRouter = express.Router()

userRouter.post("/register", registerUser)
userRouter.post("/login", loginUser)

userRouter.get("/get-profile", authUser, getProfile)
userRouter.post("/update-profile", upload.single('image'), authUser, updateProfile)
userRouter.post("/book-appointment", authUser, bookAppointment)
userRouter.get("/appointments", authUser, listAppointment)
userRouter.post("/cancel-appointment", authUser, cancelAppointment)
userRouter.post("/delete-appointment", authUser, deleteAppointment)
userRouter.post("/send-email", authUser, sendEmailToDoctor)

// MediBot public route
userRouter.post("/medibot", chatWithMediBot)

// Chat routes
userRouter.get("/chat-history/:appointmentId", authUser, getChatHistory)
userRouter.post("/chat-attachment", authUser, uploadChat.single('attachment'), uploadChatAttachment)

export default userRouter
