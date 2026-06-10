import React, { useState, useContext } from 'react'
import { DoctorContext } from '../../context/DoctorContext'

const DoctorEmailModal = ({ appointment, onClose }) => {
    const { sendEmailToPatient } = useContext(DoctorContext)
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const [isSending, setIsSending] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!subject.trim() || !message.trim()) return

        setIsSending(true)
        const success = await sendEmailToPatient(appointment._id, subject, message)
        setIsSending(false)

        if (success) {
            onClose()
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
                
                {/* Header */}
                <div className="bg-primary px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-white">Send Email to Patient</h2>
                        <p className="text-sm text-primary-50 opacity-90">To: {appointment.userData?.name}</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="e.g., Follow-up regarding your test results"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message here..."
                            rows="6"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
                            required
                        ></textarea>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSending || !subject.trim() || !message.trim()}
                            className="px-5 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSending ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                    Send Email
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default DoctorEmailModal
