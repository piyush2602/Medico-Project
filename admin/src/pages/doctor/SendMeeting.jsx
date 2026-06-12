import React, { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'

const SendMeeting = () => {
    const { dToken, appointments, getDocAppointments, sendEmailToPatient, cancelAppointment, completeAppointment } = useContext(DoctorContext)
    const { slotDateFormat } = useContext(AppContext)

    const [selectedAppt, setSelectedAppt] = useState('')
    const [meetingLink, setMeetingLink] = useState('')
    const [meetingId, setMeetingId] = useState('')
    const [meetingTime, setMeetingTime] = useState('')
    const [additionalMessage, setAdditionalMessage] = useState('')
    const [isSending, setIsSending] = useState(false)

    useEffect(() => {
        if (dToken) {
            getDocAppointments()
        }
    }, [dToken])

    const handleSendEmail = async (e) => {
        e.preventDefault()
        if (!selectedAppt) {
            toast.error('Please select an appointment')
            return
        }
        if (!meetingLink) {
            toast.error('Please provide a meeting link')
            return
        }

        setIsSending(true)

        const appt = appointments.find(a => a._id === selectedAppt)
        const patientName = appt?.userData?.name || 'Patient'

        const subject = `Virtual Meeting Details for your appointment`
        
        // Constructing HTML/Text message
        const message = `
            <p>Dear ${patientName},</p>
            <p>Here are the details for our upcoming virtual consultation:</p>
            <ul>
                <li><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></li>
                ${meetingId ? `<li><strong>Meeting ID/Password:</strong> ${meetingId}</li>` : ''}
                ${meetingTime ? `<li><strong>Timing:</strong> ${meetingTime}</li>` : ''}
            </ul>
            ${additionalMessage ? `<p><strong>Additional Message:</strong><br/>${additionalMessage.replace(/\n/g, '<br/>')}</p>` : ''}
            <p>Please join the meeting 5 minutes early.</p>
            <p>Best regards,</p>
            <p>${appt?.docData?.name}</p>
        `

        const meetingData = {
            link: meetingLink,
            id: meetingId,
            time: meetingTime,
            sentAt: new Date().toISOString()
        }

        const success = await sendEmailToPatient(selectedAppt, subject, message, meetingData)
        
        if (success) {
            setMeetingLink('')
            setMeetingId('')
            setMeetingTime('')
            setAdditionalMessage('')
            setSelectedAppt('')
        }
        setIsSending(false)
    }

    return (
        <div className='p-6 max-w-4xl'>
            <h2 className='text-2xl font-bold text-gray-800 mb-6'>Send Virtual Meeting Details</h2>
            
            <div className='bg-white p-8 rounded-2xl shadow-sm border border-gray-100'>
                <form onSubmit={handleSendEmail} className='space-y-6'>
                    {/* Patient / Appointment Selection */}
                    <div>
                        <label className='block text-sm font-semibold text-gray-700 mb-2'>Select Patient / Appointment</label>
                        <select 
                            className='w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary'
                            value={selectedAppt}
                            onChange={(e) => {
                                setSelectedAppt(e.target.value)
                                const appt = appointments.find(a => a._id === e.target.value)
                                if (appt) {
                                    setMeetingTime(`${slotDateFormat(appt.slotDate)} at ${appt.slotTime}`)
                                } else {
                                    setMeetingTime('')
                                }
                            }}
                            required
                        >
                            <option value="">-- Select an Appointment --</option>
                            {appointments.filter(a => !a.cancelled && !a.isCompleted).map((item) => (
                                <option key={item._id} value={item._id}>
                                    {item.userData.name} - {slotDateFormat(item.slotDate)} | {item.slotTime}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        {/* Meeting Link */}
                        <div>
                            <label className='block text-sm font-semibold text-gray-700 mb-2'>Meeting Link</label>
                            <input 
                                type='url'
                                className='w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary'
                                placeholder='https://meet.google.com/xyz-abc-pqr'
                                value={meetingLink}
                                onChange={(e) => setMeetingLink(e.target.value)}
                                required
                            />
                        </div>

                        {/* Meeting ID */}
                        <div>
                            <label className='block text-sm font-semibold text-gray-700 mb-2'>Meeting ID / Password (Optional)</label>
                            <input 
                                type='text'
                                className='w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary'
                                placeholder='e.g., 123 456 7890 / Pass: 1234'
                                value={meetingId}
                                onChange={(e) => setMeetingId(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Timing Slot */}
                    <div>
                        <label className='block text-sm font-semibold text-gray-700 mb-2'>Timing Slot</label>
                        <input 
                            type='text'
                            className='w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-gray-50'
                            placeholder='e.g., 10/Feb/2026 at 10:00 AM'
                            value={meetingTime}
                            onChange={(e) => setMeetingTime(e.target.value)}
                        />
                        <p className='text-xs text-gray-500 mt-1'>Auto-filled from appointment, but can be customized.</p>
                    </div>

                    {/* Additional Message */}
                    <div>
                        <label className='block text-sm font-semibold text-gray-700 mb-2'>Additional Message (Optional)</label>
                        <textarea 
                            className='w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none'
                            rows='4'
                            placeholder='Any extra instructions like "Please bring your recent lab reports..."'
                            value={additionalMessage}
                            onChange={(e) => setAdditionalMessage(e.target.value)}
                        ></textarea>
                    </div>

                    <button 
                        type='submit'
                        disabled={isSending}
                        className='w-full bg-primary text-white py-3 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-70 flex items-center justify-center gap-2'
                    >
                        {isSending ? (
                            <><svg className='animate-spin w-5 h-5' fill='none' viewBox='0 0 24 24'><circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle><path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'></path></svg>Sending...</>
                        ) : 'Send Meeting Details via Email'}
                    </button>
                </form>
            </div>

            {/* Sent Meetings Record */}
            <div className='mt-10'>
                <h3 className='text-xl font-bold text-gray-800 mb-4'>Sent Meeting Records</h3>
                <div className='bg-white border rounded shadow-sm text-sm overflow-hidden'>
                    <div className='hidden sm:grid grid-cols-[0.5fr_2fr_2fr_2fr_1.5fr_1fr_1fr] grid-flow-col py-3 px-6 border-b bg-gray-50 text-gray-600 font-semibold'>
                        <p>#</p>
                        <p>Patient</p>
                        <p>Meeting Time</p>
                        <p>Meeting Link</p>
                        <p>Meeting ID</p>
                        <p>Status</p>
                        <p>Actions</p>
                    </div>
                    {appointments.filter(a => a.meetingData).length === 0 ? (
                        <p className='p-6 text-center text-gray-500'>No meeting details sent yet.</p>
                    ) : (
                        appointments.filter(a => a.meetingData).reverse().map((item, index) => (
                            <div className='flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_2fr_2fr_2fr_1.5fr_1fr_1fr] items-center text-gray-600 py-4 px-6 border-b hover:bg-gray-50' key={item._id}>
                                <p className='max-sm:hidden'>{index + 1}</p>
                                <div className='flex items-center gap-2'>
                                    <img src={item.userData.image} className='w-8 rounded-full' alt="" /> <p className='font-medium text-gray-800'>{item.userData.name}</p>
                                </div>
                                <p>{item.meetingData?.time || (slotDateFormat(item.slotDate) + ' at ' + item.slotTime)}</p>
                                <a href={item.meetingData?.link} target='_blank' rel='noopener noreferrer' className='text-blue-500 hover:underline truncate max-w-[200px]'>
                                    {item.meetingData?.link}
                                </a>
                                <p className='truncate text-sm'>{item.meetingData?.id || '-'}</p>
                                <div>
                                    {
                                        item.cancelled 
                                            ? <span className='px-2 py-1 rounded-full text-[10px] font-semibold bg-red-100 text-red-600'>Cancelled</span>
                                            : item.isCompleted 
                                                ? <span className='px-2 py-1 rounded-full text-[10px] font-semibold bg-green-100 text-green-600'>Completed</span>
                                                : <span className='px-2 py-1 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-600'>Pending</span>
                                    }
                                </div>
                                <div>
                                    {!item.cancelled && !item.isCompleted && (
                                        <div className='flex items-center gap-2'>
                                            <button 
                                                onClick={() => completeAppointment(item._id)} 
                                                title='Mark as Completed'
                                                className='w-8 h-8 rounded-lg bg-green-50 text-green-600 hover:bg-green-600 hover:text-white flex items-center justify-center transition-all'
                                            >✓</button>
                                            <button 
                                                onClick={() => cancelAppointment(item._id)} 
                                                title='Cancel Appointment'
                                                className='w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all'
                                            >✕</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

export default SendMeeting
