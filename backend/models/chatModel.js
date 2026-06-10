import mongoose from 'mongoose'

const chatSchema = new mongoose.Schema({
    appointmentId: { type: String, required: true },
    sender: { type: String, required: true, enum: ['doctor', 'patient'] },
    text: { type: String, default: '' },
    attachment: {
        url: { type: String, default: '' },
        type: { type: String, default: '' } // 'image' or 'pdf'
    },
    timestamp: { type: Number, required: true }
})

const chatModel = mongoose.models.chat || mongoose.model('chat', chatSchema)

export default chatModel
