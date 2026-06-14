import React, { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../context/AdminContext'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'

const AdminSendMeeting = () => {
    const { aToken, appointments, getAllAppointments, completeAppointment, cancelAppointment, sendEmailToPatient } = useContext(AdminContext)
    const { slotDateFormat } = useContext(AppContext)

    const [selectedAppt, setSelectedAppt] = useState('')
    const [meetingLink, setMeetingLink] = useState('')
    const [meetingId, setMeetingId] = useState('')
    const [meetingTime, setMeetingTime] = useState('')
    const [additionalMessage, setAdditionalMessage] = useState('')
    const [isSending, setIsSending] = useState(false)

    const today = new Date()
    const todaySlotDate = `${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}`

    useEffect(() => {
        if (aToken) {
            getAllAppointments()
        }
    }, [aToken])

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
        const doctorName = appt?.docData?.name || 'Your Doctor'

        const subject = `Virtual Meeting Details for your appointment`

        const message = `
            <p>Dear ${patientName},</p>
            <p>Here are the details for your upcoming virtual consultation:</p>
            <ul>
                <li><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></li>
                ${meetingId ? `<li><strong>Meeting ID/Password:</strong> ${meetingId}</li>` : ''}
                ${meetingTime ? `<li><strong>Timing:</strong> ${meetingTime}</li>` : ''}
            </ul>
            ${additionalMessage ? `<p><strong>Additional Message:</strong><br/>${additionalMessage.replace(/\n/g, '<br/>')}</p>` : ''}
            <p>Please join the meeting 5 minutes early.</p>
            <p>Best regards,</p>
            <p>${doctorName} &amp; The Medico Admin Team</p>
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

    const statusBadge = (item) => {
        if (item.cancelled) return (
            <span className='px-2 py-1 rounded-full text-[10px] font-semibold bg-red-100 text-red-600'>Cancelled</span>
        )
        if (item.isCompleted) return (
            <span className='px-2 py-1 rounded-full text-[10px] font-semibold bg-green-100 text-green-600'>Completed</span>
        )
        return (
            <span className='px-2 py-1 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-600'>Pending</span>
        )
    }

    return (
        <div className='p-6 max-w-4xl'>
            <h2 className='text-2xl font-bold text-gray-800 mb-6'>Send Virtual Meeting Details</h2>

            {/* Email Form */}
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
                                    setMeetingLink(appt.meetingData?.link || '')
                                    setMeetingId(appt.meetingData?.id || '')
                                } else {
                                    setMeetingTime('')
                                    setMeetingLink('')
                                    setMeetingId('')
                                }
                            }}
                            required
                        >
                            <option value="">-- Select an Appointment --</option>
                            {appointments.filter(a => !a.cancelled && !a.isCompleted).map((item) => (
                                <option key={item._id} value={item._id}>
                                    {item.userData?.name} → Dr. {item.docData?.name} | {slotDateFormat(item.slotDate)} {item.slotTime}
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

            {/* Today's Appointments */}
            <div className='mt-10'>
                <h3 className='text-xl font-bold text-gray-800 mb-4'>Today's Appointments</h3>
                <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
                    <div className='hidden sm:grid grid-cols-[0.5fr_2fr_2fr_2fr_2fr_1.5fr_1fr_1fr] gap-4 py-3 px-6 border-b bg-gray-50/80 text-xs font-semibold text-gray-400 uppercase tracking-wide'>
                        <p>#</p>
                        <p>Patient</p>
                        <p>Doctor</p>
                        <p>Meeting Time</p>
                        <p>Meeting Link</p>
                        <p>Meeting ID</p>
                        <p>Status</p>
                        <p>Actions</p>
                    </div>
                    {appointments.filter(a => a.slotDate === todaySlotDate).length === 0 ? (
                        <div className='px-6 py-12 text-center'>
                            <div className='text-4xl mb-3'>📅</div>
                            <p className='text-gray-500'>No appointments today.</p>
                        </div>
                    ) : (
                        appointments.filter(a => a.slotDate === todaySlotDate).map((item, index) => (
                            <div className='flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_2fr_2fr_2fr_2fr_1.5fr_1fr_1fr] gap-4 items-center text-gray-600 py-4 px-6 border-b hover:bg-blue-50/30 transition-colors' key={item._id}>
                                <p className='max-sm:hidden text-xs text-gray-400 font-mono'>{index + 1}</p>
                                <div className='flex items-center gap-2'>
                                    <img
                                        src={item.userData?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.userData?.name || 'P')}&background=6366f1&color=fff`}
                                        className='w-8 h-8 rounded-full object-cover border border-gray-100' alt=""
                                    />
                                    <p className='font-medium text-gray-800 text-sm truncate'>{item.userData?.name}</p>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <img
                                        src={item.docData?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.docData?.name || 'D')}&background=5f6fff&color=fff`}
                                        className='w-8 h-8 rounded-full object-cover border border-gray-100 bg-gray-100' alt=""
                                    />
                                    <p className='text-sm text-gray-700 truncate'>{item.docData?.name}</p>
                                </div>
                                <p className='text-sm'>{item.meetingData?.time || (slotDateFormat(item.slotDate) + ' at ' + item.slotTime)}</p>
                                {item.meetingData?.link ? (
                                    <a href={item.meetingData.link} target='_blank' rel='noopener noreferrer' className='text-blue-500 hover:underline truncate text-sm max-w-[180px]'>
                                        {item.meetingData.link}
                                    </a>
                                ) : (
                                    <p className='text-gray-400 text-sm'>Not sent</p>
                                )}
                                <p className='truncate text-sm'>{item.meetingData?.id || '-'}</p>
                                <div>{statusBadge(item)}</div>
                                <div>
                                    {!item.cancelled && !item.isCompleted && (
                                        <div className='flex items-center gap-1.5'>
                                            <button
                                                onClick={() => completeAppointment(item._id)}
                                                title='Mark as Completed'
                                                className='w-8 h-8 rounded-lg bg-green-50 text-green-600 hover:bg-green-600 hover:text-white flex items-center justify-center transition-all text-sm font-bold'
                                            >✓</button>
                                            <button
                                                onClick={() => cancelAppointment(item._id)}
                                                title='Cancel Appointment'
                                                className='w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all text-sm font-bold'
                                            >✕</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Sent Meeting Records */}
            <div className='mt-10'>
                <h3 className='text-xl font-bold text-gray-800 mb-4'>Sent Meeting Records</h3>
                <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
                    <div className='hidden sm:grid grid-cols-[0.5fr_2fr_2fr_2fr_2fr_1.5fr_1fr_1fr] gap-4 py-3 px-6 border-b bg-gray-50/80 text-xs font-semibold text-gray-400 uppercase tracking-wide'>
                        <p>#</p>
                        <p>Patient</p>
                        <p>Doctor</p>
                        <p>Meeting Time</p>
                        <p>Meeting Link</p>
                        <p>Meeting ID</p>
                        <p>Status</p>
                        <p>Actions</p>
                    </div>
                    {appointments.filter(a => a.meetingData).length === 0 ? (
                        <div className='px-6 py-12 text-center'>
                            <div className='text-4xl mb-3'>📬</div>
                            <p className='text-gray-500'>No meeting details sent yet.</p>
                        </div>
                    ) : (
                        appointments.filter(a => a.meetingData).slice().reverse().map((item, index) => (
                            <div className='flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_2fr_2fr_2fr_2fr_1.5fr_1fr_1fr] gap-4 items-center text-gray-600 py-4 px-6 border-b hover:bg-blue-50/30 transition-colors' key={item._id}>
                                <p className='max-sm:hidden text-xs text-gray-400 font-mono'>{index + 1}</p>
                                <div className='flex items-center gap-2'>
                                    <img
                                        src={item.userData?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.userData?.name || 'P')}&background=6366f1&color=fff`}
                                        className='w-8 h-8 rounded-full object-cover border border-gray-100' alt=""
                                    />
                                    <p className='font-medium text-gray-800 text-sm truncate'>{item.userData?.name}</p>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <img
                                        src={item.docData?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.docData?.name || 'D')}&background=5f6fff&color=fff`}
                                        className='w-8 h-8 rounded-full object-cover border border-gray-100 bg-gray-100' alt=""
                                    />
                                    <p className='text-sm text-gray-700 truncate'>{item.docData?.name}</p>
                                </div>
                                <p className='text-sm'>{item.meetingData?.time || (slotDateFormat(item.slotDate) + ' at ' + item.slotTime)}</p>
                                <a href={item.meetingData?.link} target='_blank' rel='noopener noreferrer' className='text-blue-500 hover:underline truncate text-sm max-w-[180px]'>
                                    {item.meetingData?.link}
                                </a>
                                <p className='truncate text-sm'>{item.meetingData?.id || '-'}</p>
                                <div>{statusBadge(item)}</div>
                                <div>
                                    {!item.cancelled && !item.isCompleted && (
                                        <div className='flex items-center gap-1.5'>
                                            <button
                                                onClick={() => completeAppointment(item._id)}
                                                title='Mark as Completed'
                                                className='w-8 h-8 rounded-lg bg-green-50 text-green-600 hover:bg-green-600 hover:text-white flex items-center justify-center transition-all text-sm font-bold'
                                            >✓</button>
                                            <button
                                                onClick={() => cancelAppointment(item._id)}
                                                title='Cancel Appointment'
                                                className='w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all text-sm font-bold'
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

export default AdminSendMeeting
