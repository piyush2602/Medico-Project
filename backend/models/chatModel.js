import mongoose from 'mongoose'

const chatSchema = new mongoose.Schema({
    appointmentId: { type: String, required: true },
    sender: { type: String, required: true, enum: ['doctor', 'patient'] },
    text: { type: String, default: '' },
    attachment: {
        url: { type: String, default: '' },
        type: { type: String, default: '' } // 'image' or 'pdf'
    },
    isRead: { type: Boolean, default: false },
    timestamp: { type: Number, required: true }
})

// Index for fast unread-count lookups per appointment
chatSchema.index({ appointmentId: 1, sender: 1, isRead: 1 })

const chatModel = mongoose.models.chat || mongoose.model('chat', chatSchema)

export default chatModel
