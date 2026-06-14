import React, { useContext, useEffect } from 'react'
import { AdminContext } from '../context/AdminContext'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'

const Dashboard = () => {

    const { aToken, getDashData, cancelAppointment, completeAppointment, dashData } = useContext(AdminContext)
    const { slotDateFormat } = useContext(AppContext)

    useEffect(() => {
        if (aToken) {
            getDashData()
        }
    }, [aToken])

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

    return dashData && (
        <div className='m-5'>

            <div className='flex flex-wrap gap-3'>

                <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
                    <img className='w-14' src={assets.doctor_icon} alt="" />
                    <div>
                        <p className='text-xl font-semibold text-gray-600'>{dashData.doctors}</p>
                        <p className='text-gray-400'>Doctors</p>
                    </div>
                </div>

                <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
                    <img className='w-14' src={assets.appointments_icon} alt="" />
                    <div>
                        <p className='text-xl font-semibold text-gray-600'>{dashData.appointments}</p>
                        <p className='text-gray-400'>Appointments</p>
                    </div>
                </div>

                <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
                    <img className='w-14' src={assets.patients_icon} alt="" />
                    <div>
                        <p className='text-xl font-semibold text-gray-600'>{dashData.patients}</p>
                        <p className='text-gray-400'>Patients</p>
                    </div>
                </div>

            </div>

            {/* Latest Bookings — modern card UI matching DoctorAppointments style */}
            <div className='mt-10'>
                <div className='flex items-center gap-2.5 mb-4'>
                    <img src={assets.list_icon} alt="" />
                    <p className='text-lg font-bold text-gray-800'>Latest Bookings</p>
                </div>

                <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
                    {/* Table Header */}
                    <div className='hidden sm:grid grid-cols-[40px_2.5fr_2fr_2fr_1.5fr_140px] gap-4 items-center px-6 py-3 bg-gray-50/80 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide'>
                        <span>#</span>
                        <span>Doctor</span>
                        <span>Patient</span>
                        <span>Date &amp; Time</span>
                        <span>Status</span>
                        <span>Actions</span>
                    </div>

                    <div className='divide-y divide-gray-50'>
                        {dashData.latestAppointments.length === 0 && (
                            <div className='px-6 py-16 text-center'>
                                <div className='text-5xl mb-4'>📭</div>
                                <p className='text-gray-500 font-medium'>No appointments yet</p>
                            </div>
                        )}
                        {dashData.latestAppointments.map((item, idx) => (
                            <div key={item._id} className='flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[40px_2.5fr_2fr_2fr_1.5fr_140px] gap-4 items-center px-6 py-4 hover:bg-blue-50/30 transition-colors'>

                                {/* # */}
                                <span className='text-xs text-gray-400 font-mono w-6'>{idx + 1}</span>

                                {/* Doctor */}
                                <div className='flex items-center gap-3 min-w-0'>
                                    <img
                                        src={item.docData?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.docData?.name || 'D')}&background=5f6fff&color=fff`}
                                        alt={item.docData?.name}
                                        className='w-9 h-9 rounded-full object-cover border border-gray-100 flex-shrink-0 bg-gray-100'
                                    />
                                    <div className='min-w-0'>
                                        <p className='font-semibold text-gray-800 text-sm truncate'>{item.docData?.name}</p>
                                        <p className='text-xs text-gray-400 truncate'>{item.docData?.speciality}</p>
                                    </div>
                                </div>

                                {/* Patient */}
                                <div className='flex items-center gap-2 min-w-0'>
                                    <img
                                        src={item.userData?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.userData?.name || 'P')}&background=6366f1&color=fff`}
                                        alt={item.userData?.name}
                                        className='w-8 h-8 rounded-full object-cover border border-gray-100 flex-shrink-0'
                                    />
                                    <p className='text-sm text-gray-700 font-medium truncate'>{item.userData?.name}</p>
                                </div>

                                {/* Date & Time */}
                                <div>
                                    <p className='text-sm text-gray-700 font-medium'>{slotDateFormat(item.slotDate)}</p>
                                    <p className='text-xs text-gray-400'>{item.slotTime}</p>
                                </div>

                                {/* Status badge */}
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

        </div>
    )
}

export default Dashboard
