import React, { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../context/AdminContext'
import { AppContext } from '../context/AppContext'

const FILTERS = ['All', 'Pending', 'Completed', 'Cancelled']

const TodayAppointments = () => {
    const { aToken, appointments, getAllAppointments, cancelAppointment, completeAppointment } = useContext(AdminContext)
    const { slotDateFormat } = useContext(AppContext)
    const [filter, setFilter] = useState('All')

    useEffect(() => {
        if (aToken) getAllAppointments()
    }, [aToken])

    const today = new Date()
    const todaySlotDate = `${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}`
    const todayAppts = appointments.filter(a => a.slotDate === todaySlotDate)

    const filtered = todayAppts.filter(a => {
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

    const todayLabel = today.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

    return (
        <div className='p-6'>
            {/* Page title */}
            <div className='mb-5'>
                <h2 className='text-2xl font-bold text-gray-800'>Today's Appointments</h2>
                <p className='text-sm text-gray-400 mt-1'>{todayLabel} — {todayAppts.length} appointment{todayAppts.length !== 1 ? 's' : ''} scheduled today.</p>
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
                    >
                        {f} ({f === 'All' ? todayAppts.length : todayAppts.filter(a => {
                            if (f === 'Pending') return !a.cancelled && !a.isCompleted
                            if (f === 'Completed') return a.isCompleted
                            return a.cancelled
                        }).length})
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
                {/* Header */}
                <div className='hidden sm:grid grid-cols-[40px_2.5fr_2fr_2fr_1.5fr_1fr_1.5fr_140px] gap-4 items-center px-6 py-3 bg-gray-50/80 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide'>
                    <span>#</span>
                    <span>Patient</span>
                    <span>Doctor</span>
                    <span>Date &amp; Time</span>
                    <span>Age</span>
                    <span>Fees</span>
                    <span>Status</span>
                    <span>Actions</span>
                </div>

                <div className='divide-y divide-gray-50'>
                    {filtered.length === 0 && (
                        <div className='px-6 py-16 text-center'>
                            <div className='text-5xl mb-4'>📅</div>
                            <p className='text-gray-500 font-medium'>
                                {todayAppts.length === 0
                                    ? 'No appointments scheduled for today'
                                    : `No ${filter.toLowerCase()} appointments today`}
                            </p>
                        </div>
                    )}
                    {filtered.map((item, idx) => (
                        <div
                            key={item._id}
                            className='flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[40px_2.5fr_2fr_2fr_1.5fr_1fr_1.5fr_140px] gap-4 items-center px-6 py-4 hover:bg-blue-50/30 transition-colors'
                        >
                            {/* # */}
                            <span className='text-xs text-gray-400 font-mono'>{idx + 1}</span>

                            {/* Patient */}
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

                            {/* Doctor */}
                            <div className='flex items-center gap-2 min-w-0'>
                                <img
                                    src={item.docData?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.docData?.name || 'D')}&background=5f6fff&color=fff`}
                                    alt={item.docData?.name}
                                    className='w-8 h-8 rounded-full object-cover border border-gray-100 flex-shrink-0 bg-gray-100'
                                />
                                <div className='min-w-0'>
                                    <p className='text-sm text-gray-700 font-medium truncate'>{item.docData?.name}</p>
                                    <p className='text-xs text-gray-400 truncate'>{item.docData?.speciality}</p>
                                </div>
                            </div>

                            {/* Date & Time */}
                            <div>
                                <p className='text-sm text-gray-700 font-medium'>{slotDateFormat(item.slotDate)}</p>
                                <p className='text-xs text-gray-400'>{item.slotTime}</p>
                            </div>

                            {/* Age */}
                            <span className='text-sm text-gray-600'>{item.userData?.age || 'N/A'}</span>

                            {/* Fees */}
                            <span className='text-sm font-semibold text-gray-700'>₹{item.amount}</span>

                            {/* Status */}
                            {statusBadge(item)}

                            {/* Actions */}
                            <div className='flex items-center gap-1.5'>
                                {!item.cancelled && !item.isCompleted ? (
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
                                ) : (
                                    <span className='text-xs text-gray-400 italic'>
                                        {item.isCompleted ? 'Done' : 'Cancelled'}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default TodayAppointments
