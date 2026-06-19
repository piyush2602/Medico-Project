import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import {v2 as cloudinary} from 'cloudinary'
import appointmentModel from '../models/appointmentModel.js'
import doctorModel from '../models/doctorModel.js'
import chatModel from '../models/chatModel.js'
import { sendWelcomeEmail, sendAppointmentConfirmation, sendAppointmentCancellation, sendSignInEmail, sendPatientCustomEmail } from '../config/notifier.js'

// api to register user
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body

        if (!name || !email || !password) {
            return res.json({ success: false, message: "Missing Details" })
        }

        // validating email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Enter valid email" })
        }

        // validating strong password
        if (password.length < 8) {
            return res.json({ success: false, message: "Enter a strong password" })
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const userData = {
            name,
            email,
            password: hashedPassword,
        }

        const newUser = new userModel(userData)
        const user = await newUser.save()

        // Send Welcome Email
        sendWelcomeEmail(user.email, user.name);

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

        res.json({ success: true, token })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// api for user login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await userModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: "User does not exist" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            
            // Get device name from User-Agent header
            const userAgent = req.headers['user-agent'] || 'Unknown Device';
            sendSignInEmail(user.email, user.name, userAgent);

            res.json({ success: true, token })
        }
        else {
            res.json({ success: false, message: "Invalid credentials" })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// api to get user profile data
const getProfile = async (req, res) => {
    try {
        const { userId } = req.body
        const userData = await userModel.findById(userId).select('-password')

        res.json({ success: true, userData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// api to update user profile
const updateProfile = async (req, res) => {
    try {
        const { userId, name, phone, address, dob, gender } = req.body
        const imageFile = req.file

        if (!name || !phone || !dob || !gender) {
            return res.json({ success: false, message: "Data Missing" })
        }

        const updateData = { name, phone, address: JSON.parse(address), dob, gender }

        // Upload image to cloudinary if provided
        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
            updateData.image = imageUpload.secure_url
        }

        await userModel.findByIdAndUpdate(userId, updateData)

        res.json({ success: true, message: 'Profile Updated' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// api to book appointment
const bookAppointment = async (req, res) => {
    try {
        const { userId, docId, slotDate, slotTime } = req.body

        const docData = await doctorModel.findById(docId).select("-password")

        if (!docData.available) {
            return res.json({ success: false, message: 'Doctor Not Available' })
        }

        let slots_booked = docData.slots_booked

        // checking for slot availability
        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({ success: false, message: 'Slot Not Available' })
            }
            else {
                slots_booked[slotDate].push(slotTime)
            }
        }
        else {
            slots_booked[slotDate] = []
            slots_booked[slotDate].push(slotTime)
        }

        const userData = await userModel.findById(userId).select("-password")

        delete docData.slots_booked

        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount: docData.fees,
            slotTime,
            slotDate,
            date: Date.now()
        }

        const newAppointment = new appointmentModel(appointmentData)
        await newAppointment.save()

        // save new slots data in docData
        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        // Send Booking Emails
        sendAppointmentConfirmation(userData.email, docData.email, userData.name, docData.name, slotDate, slotTime);

        res.json({ success: true, message: 'Appointment Booked' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// api to get user appointments for frontend my-appointments page
const listAppointment = async (req, res) => {
    try {
        const { userId } = req.body
        const appointments = await appointmentModel.find({ userId }).lean()

        // Single aggregation to get unread counts for ALL appointments at once
        const appointmentIds = appointments.map(a => a._id.toString())
        const unreadCounts = await chatModel.aggregate([
            {
                $match: {
                    appointmentId: { $in: appointmentIds },
                    sender: 'doctor',
                    isRead: false
                }
            },
            {
                $group: {
                    _id: '$appointmentId',
                    count: { $sum: 1 }
                }
            }
        ])

        // Build a lookup map: appointmentId -> unreadCount
        const unreadMap = {}
        for (const entry of unreadCounts) {
            unreadMap[entry._id] = entry.count
        }

        // Attach unread counts to each appointment
        for (const appt of appointments) {
            appt.unreadCount = unreadMap[appt._id.toString()] || 0
        }

        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// api to cancel appointment
const cancelAppointment = async (req, res) => {
    try {
        const { userId, appointmentId } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)

        // verify appointment user
        if (appointmentData.userId !== userId) {
            return res.json({ success: false, message: 'Unauthorized action' })
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

        // releasing doctor slot
        const { docId, slotDate, slotTime } = appointmentData

        const doctorData = await doctorModel.findById(docId)

        let slots_booked = doctorData.slots_booked

        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)

        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        // Fetch user data for email
        const userData = await userModel.findById(userId)

        // Send Cancellation Emails
        sendAppointmentCancellation(userData.email, doctorData.email, userData.name, doctorData.name, slotDate, slotTime, 'Patient');

        res.json({ success: true, message: 'Appointment Cancelled' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// api to permanently delete a completed or cancelled appointment from db
const deleteAppointment = async (req, res) => {
    try {
        const { userId, appointmentId } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData) {
            return res.json({ success: false, message: 'Appointment not found' })
        }

        // verify appointment belongs to this user
        if (appointmentData.userId !== userId) {
            return res.json({ success: false, message: 'Unauthorized action' })
        }

        // only allow deletion of completed or cancelled appointments
        if (!appointmentData.cancelled && !appointmentData.isCompleted) {
            return res.json({ success: false, message: 'Only completed or cancelled appointments can be deleted' })
        }

        await appointmentModel.findByIdAndDelete(appointmentId)

        res.json({ success: true, message: 'Appointment record deleted successfully' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// api to get chat history for an appointment
const getChatHistory = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        
        // Mark messages from doctor as read
        await chatModel.updateMany(
            { appointmentId, sender: 'doctor', isRead: false },
            { $set: { isRead: true } }
        );

        const messages = await chatModel.find({ appointmentId }).sort({ timestamp: 1 });
        res.json({ success: true, messages });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// api to upload chat attachment
const uploadChatAttachment = async (req, res) => {
    try {
        const imageFile = req.file;
        if (!imageFile) {
            return res.json({ success: false, message: "No file provided" });
        }
        
        const isPdf = imageFile.mimetype === 'application/pdf';
        const fileUpload = await cloudinary.uploader.upload(imageFile.path, { 
            resource_type: isPdf ? "raw" : "auto" 
        });
        
        res.json({ 
            success: true, 
            attachment: {
                url: fileUpload.secure_url,
                type: isPdf ? 'pdf' : 'image'
            }
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// api to send email from patient to doctor
const sendEmailToDoctor = async (req, res) => {
    try {
        const { userId, appointmentId, subject, message } = req.body

        if (!subject || !message) {
            return res.json({ success: false, message: 'Subject and message are required' })
        }

        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData) {
            return res.json({ success: false, message: 'Appointment not found' })
        }

        // verify appointment belongs to this user
        if (appointmentData.userId !== userId) {
            return res.json({ success: false, message: 'Unauthorized action' })
        }

        const userData = await userModel.findById(userId)
        const doctorData = await doctorModel.findById(appointmentData.docId)

        if (!doctorData) {
            return res.json({ success: false, message: 'Doctor not found' })
        }

        const emailSent = await sendPatientCustomEmail(
            'medico.healthcare.solutions@gmail.com',
            doctorData.name,
            userData.name,
            subject,
            message
        )

        if (emailSent) {
            res.json({ success: true, message: 'Email sent to doctor successfully' })
        } else {
            res.json({ success: false, message: 'Failed to send email. Please try again.' })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment, deleteAppointment, getChatHistory, uploadChatAttachment, sendEmailToDoctor }
