import mongoose from 'mongoose'

const appointmentSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    docId: { type: String, required: true },
    slotDate: { type: String, required: true },
    slotTime: { type: String, required: true },
    userData: { type: Object, required: true },
    docData: { type: Object, required: true },
    amount: { type: Number, required: true },
    date: { type: Number, required: true },
    cancelled: { type: Boolean, default: false },
    payment: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false },
    prescription: { type: Object, default: null },
    meetingData: { type: Object, default: null },
    medicalCertificate: { type: Object, default: null }
    // prescription shape: { medicines: [{name,dosage,frequency,duration}], instructions, followUpDate, notes, createdAt }
    // medicalCertificate shape: { patientName, age, gender, diagnosis, fitForDuty, leaveDays, fromDate, toDate, remarks, issuedAt }
})

// Index for fast lookup by patient
appointmentSchema.index({ userId: 1 })
// Index for fast lookup by doctor
appointmentSchema.index({ docId: 1 })

const appointmentModel = mongoose.models.appointment || mongoose.model('appointment', appointmentSchema)

export default appointmentModel
