import React, { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import PrescriptionModal from './PrescriptionModal'
import DoctorChatModal from './DoctorChatModal'
import DoctorEmailModal from './DoctorEmailModal'
import MedicalCertificateModal from './MedicalCertificateModal'

const FILTERS = ['All', 'Pending', 'Completed', 'Cancelled']

const DoctorAppointments = ({ isToday = false }) => {
    const { dToken, appointments, setAppointments, getDocAppointments, cancelAppointment, completeAppointment } = useContext(DoctorContext)
    const { slotDateFormat } = useContext(AppContext)
    const [filter, setFilter] = useState('All')
    const [prescriptionAppt, setPrescriptionAppt] = useState(null)
    const [chatAppt, setChatAppt] = useState(null)
    const [emailAppt, setEmailAppt] = useState(null)
    const [certAppt, setCertAppt] = useState(null)

    useEffect(() => {
        if (dToken) getDocAppointments()
    }, [dToken])

    const today = new Date()
    const todaySlotDate = `${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}`
    const baseAppointments = isToday ? appointments.filter(a => a.slotDate === todaySlotDate) : appointments;

    const filtered = baseAppointments.filter(a => {
        if (filter === 'Pending') return !a.cancelled && !a.isCompleted
        if (filter === 'Completed') return a.isCompleted
        if (filter === 'Cancelled') return a.cancelled
        return true
    })

    const statusBadge = (item) => {
        if (item.cancelled) return (
            <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600'>
                <span className='w-1.5 h-1.5 rounded-full bg-red-400 inline-block'></span> Cancelled
            </span>
        )
        if (item.isCompleted) return (
            <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-600'>
                <span className='w-1.5 h-1.5 rounded-full bg-green-400 inline-block'></span> Completed
            </span>
        )
        return (
            <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-600'>
                <span className='w-1.5 h-1.5 rounded-full bg-amber-400 inline-block'></span> Pending
            </span>
        )
    }

    return (
        <div className='p-6'>
            {/* Page title */}
            <div className='mb-5'>
                <h2 className='text-2xl font-bold text-gray-800'>{isToday ? "Today's Appointments" : "My Appointments"}</h2>
                <p className='text-sm text-gray-400 mt-1'>Manage your appointments, mark them complete, or write prescriptions.</p>
            </div>

            {/* Filter tabs */}
            <div className='flex gap-2 mb-5 flex-wrap'>
                {FILTERS.map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                            filter === f
                                ? 'bg-primary text-white shadow-md shadow-primary/30'
                                : 'bg-white text-gray-500 border border-gray-200 hover:border-primary hover:text-primary'
                        }`}
                    >{f} {f === 'All' ? `(${baseAppointments.length})` : `(${baseAppointments.filter(a => {
                        if (f === 'Pending') return !a.cancelled && !a.isCompleted
                        if (f === 'Completed') return a.isCompleted
                        return a.cancelled
                    }).length})`}</button>
                ))}
            </div>

            {/* Table */}
            <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
                {/* Table Header */}
                <div className='hidden sm:grid sm:grid-cols-[40px_3fr_2fr_1fr_1.5fr_220px] gap-4 items-center px-6 py-3 bg-gray-50/80 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide'>
                    <span>#</span>
                    <span>Patient</span>
                    <span>Date & Time</span>
                    <span>Fees</span>
                    <span>Status</span>
                    <span>Actions</span>
                </div>

                <div className='divide-y divide-gray-50'>
                    {filtered.length === 0 && (
                        <div className='px-6 py-16 text-center'>
                            <div className='text-5xl mb-4'>📭</div>
                            <p className='text-gray-500 font-medium'>No {filter.toLowerCase()} appointments found</p>
                        </div>
                    )}
                    {filtered.map((item, idx) => (
                        <div key={item._id} className='flex flex-col sm:grid sm:grid-cols-[40px_3fr_2fr_1fr_1.5fr_220px] gap-3 sm:gap-4 sm:items-center px-4 sm:px-6 py-4 hover:bg-blue-50/30 transition-colors border-b sm:border-b-0 border-gray-50'>

                            {/* # */}
                            <span className='hidden sm:block text-xs text-gray-400 font-mono w-6'>{idx + 1}</span>

                            {/* Patient */}
                            <div className='flex items-center justify-between sm:justify-start gap-3 min-w-0'>
                                <div className='flex items-center gap-3 min-w-0'>
                                    <img
                                        src={item.userData?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.userData?.name || 'P')}&background=6366f1&color=fff`}
                                        alt={item.userData?.name}
                                        className='w-9 h-9 rounded-full object-cover border border-gray-100 flex-shrink-0'
                                    />
                                    <div className='min-w-0'>
                                        <p className='font-semibold text-gray-800 text-sm truncate'>{item.userData?.name}</p>
                                        <p className='text-xs text-gray-400 truncate'>{item.userData?.email}</p>
                                    </div>
                                </div>
                                <div className='sm:hidden'>
                                    {statusBadge(item)}
                                </div>
                            </div>

                            {/* Date & Time */}
                            <div className='flex justify-between sm:block items-center sm:items-start text-sm'>
                                <span className='sm:hidden font-medium text-gray-500 text-xs'>Date & Time</span>
                                <div className='text-right sm:text-left'>
                                    <p className='text-sm text-gray-700 font-medium'>{slotDateFormat(item.slotDate)}</p>
                                    <p className='text-xs text-gray-400'>{item.slotTime}</p>
                                </div>
                            </div>

                            {/* Fees */}
                            <div className='flex justify-between sm:block items-center sm:items-start text-sm'>
                                <span className='sm:hidden font-medium text-gray-500 text-xs'>Fees</span>
                                <span className='text-sm font-semibold text-gray-700'>₹{item.amount}</span>
                            </div>

                            {/* Status */}
                            <div className='hidden sm:block'>
                                {statusBadge(item)}
                            </div>

                            {/* Actions */}
                            <div className='flex items-center justify-end sm:justify-start gap-1.5 mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-gray-100 flex-wrap'>
                                {!item.cancelled && !item.isCompleted && (
                                    <>
                                        <button
                                            onClick={() => completeAppointment(item._id)}
                                            title='Mark as Completed'
                                            className='w-8 h-8 rounded-lg bg-green-50 text-green-600 hover:bg-green-500 hover:text-white flex items-center justify-center transition-all text-sm font-bold'
                                        >✓</button>
                                        <button
                                            onClick={() => cancelAppointment(item._id)}
                                            title='Cancel Appointment'
                                            className='w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all text-sm font-bold'
                                        >✕</button>
                                    </>
                                )}
                                {/* Prescription button – available when not cancelled */}
                                {!item.cancelled && (
                                    <button
                                        onClick={() => setPrescriptionAppt(item)}
                                        title={item.prescription ? 'Edit Prescription' : 'Write Prescription'}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all text-sm ${
                                            item.prescription
                                                ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-500 hover:text-white'
                                                : 'bg-gray-100 text-gray-500 hover:bg-indigo-500 hover:text-white'
                                        }`}
                                    >
                                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                                                d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                                        </svg>
                                    </button>
                                )}
                                {/* Chat button - available when not cancelled */}
                                {!item.cancelled && (
                                    <button
                                        onClick={() => {
                                            setChatAppt(item);
                                            if (item.unreadCount > 0) {
                                                setAppointments(prev => prev.map(a => a._id === item._id ? { ...a, unreadCount: 0 } : a));
                                            }
                                        }}
                                        title="Chat with Patient"
                                        className="relative w-8 h-8 rounded-lg flex items-center justify-center transition-all text-sm bg-blue-100 text-blue-600 hover:bg-blue-500 hover:text-white"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                        {item.unreadCount > 0 && (
                                            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
                                                {item.unreadCount}
                                            </span>
                                        )}
                                    </button>
                                )}
                                {/* Email button - available when not cancelled */}
                                {!item.cancelled && (
                                    <button
                                        onClick={() => setEmailAppt(item)}
                                        title="Send Email to Patient"
                                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all text-sm bg-purple-100 text-purple-600 hover:bg-purple-500 hover:text-white"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </button>
                                )}
                                {/* Medical Certificate button - available when not cancelled */}
                                {!item.cancelled && (
                                    <button
                                        onClick={() => setCertAppt(item)}
                                        title={item.medicalCertificate ? 'Edit Medical Certificate' : 'Issue Medical Certificate'}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all text-sm ${
                                            item.medicalCertificate
                                                ? 'bg-teal-100 text-teal-600 hover:bg-teal-500 hover:text-white'
                                                : 'bg-gray-100 text-gray-500 hover:bg-teal-500 hover:text-white'
                                        }`}
                                    >
                                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                                                d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' />
                                        </svg>
                                    </button>
                                )}
                            </div>

                        </div>
                    ))}
                </div>
            </div>

            {/* Prescription Modal */}
            {prescriptionAppt && (
                <PrescriptionModal
                    appointment={prescriptionAppt}
                    onClose={() => setPrescriptionAppt(null)}
                />
            )}

            {/* Chat Modal */}
            {chatAppt && (
                <DoctorChatModal
                    appointment={chatAppt}
                    onClose={() => setChatAppt(null)}
                />
            )}

            {/* Email Modal */}
            {emailAppt && (
                <DoctorEmailModal
                    appointment={emailAppt}
                    onClose={() => setEmailAppt(null)}
                />
            )}

            {/* Medical Certificate Modal */}
            {certAppt && (
                <MedicalCertificateModal
                    appointment={certAppt}
                    onClose={() => setCertAppt(null)}
                />
            )}
        </div>
    )
}

export default DoctorAppointments
