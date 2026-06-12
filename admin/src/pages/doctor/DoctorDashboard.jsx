import React, { useContext, useEffect } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'

const StatCard = ({ icon, label, value, color, bg }) => (
    <div className={`flex items-center gap-4 p-5 rounded-2xl ${bg} border border-white/60 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-default min-w-[200px] flex-1`}>
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${color} shadow-inner`}>
            {icon}
        </div>
        <div>
            <p className='text-3xl font-bold text-gray-800'>{value}</p>
            <p className='text-sm text-gray-500 font-medium mt-0.5'>{label}</p>
        </div>
    </div>
)

const statusBadge = (item) => {
    if (item.cancelled) return <span className='px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600'>Cancelled</span>
    if (item.isCompleted) return <span className='px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-600'>Completed</span>
    return <span className='px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-600'>Pending</span>
}

const DoctorDashboard = () => {
    const { dToken, dashData, getDocAppointments, getDocProfile, docProfile, cancelAppointment, completeAppointment } = useContext(DoctorContext)
    const { slotDateFormat } = useContext(AppContext)

    useEffect(() => {
        if (dToken) {
            getDocAppointments()
            getDocProfile()
        }
    }, [dToken])

    if (!dashData) {
        return (
            <div className='flex items-center justify-center h-[60vh]'>
                <div className='text-center'>
                    <div className='w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
                    <p className='text-gray-500'>Loading dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className='p-6 space-y-6'>

            {/* Welcome Banner */}
            {docProfile && (
                <div className='bg-gradient-to-r from-primary to-indigo-600 rounded-2xl p-6 text-white flex items-center gap-4 shadow-lg'>
                    <img src={docProfile.image} alt={docProfile.name}
                        className='w-16 h-16 rounded-xl object-cover border-2 border-white/40 shadow' />
                    <div>
                        <p className='text-sm font-medium text-indigo-200'>Welcome back,</p>
                        <h1 className='text-2xl font-bold'>{docProfile.name}</h1>
                        <p className='text-indigo-200 text-sm'>{docProfile.speciality} • {docProfile.degree} • {docProfile.experience} exp.</p>
                    </div>
                    <div className='ml-auto text-right hidden sm:block'>
                        <p className='text-indigo-200 text-xs'>Today's Date</p>
                        <p className='text-white font-semibold'>{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className='flex flex-wrap gap-4'>
                <StatCard icon='📅' label='Total Appointments' value={dashData.total} color='bg-indigo-100 text-indigo-600' bg='bg-white' />
                <StatCard icon='⏳' label='Pending' value={dashData.pending} color='bg-amber-100 text-amber-600' bg='bg-white' />
                <StatCard icon='✅' label='Completed' value={dashData.completed} color='bg-green-100 text-green-600' bg='bg-white' />
                <StatCard icon='❌' label='Cancelled' value={dashData.cancelled} color='bg-red-100 text-red-600' bg='bg-white' />
            </div>

            {/* Latest Appointments */}
            <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
                <div className='flex items-center gap-2 px-6 py-4 border-b bg-gray-50/80'>
                    <svg className='w-5 h-5 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
                    </svg>
                    <p className='font-semibold text-gray-700'>Latest Appointments</p>
                </div>
                <div className='divide-y divide-gray-50'>
                    {dashData.latest.length === 0 && (
                        <div className='px-6 py-10 text-center text-gray-400'>
                            <p className='text-4xl mb-3'>📭</p>
                            <p>No appointments yet</p>
                        </div>
                    )}
                    {dashData.latest.map((item, idx) => (
                        <div key={idx} className='flex items-center px-6 py-3.5 gap-4 hover:bg-gray-50/80 transition-colors'>
                            <img
                                src={item.userData?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.userData?.name || 'P')}&background=6366f1&color=fff`}
                                alt={item.userData?.name}
                                className='w-10 h-10 rounded-full object-cover border border-gray-100'
                            />
                            <div className='flex-1 min-w-0'>
                                <p className='font-semibold text-gray-800 text-sm truncate'>{item.userData?.name}</p>
                                <p className='text-xs text-gray-400'>{slotDateFormat(item.slotDate)} | {item.slotTime}</p>
                            </div>
                            <div className='flex items-center gap-2'>
                                {statusBadge(item)}
                                {!item.cancelled && !item.isCompleted && (
                                    <div className='flex gap-1'>
                                        <button
                                            onClick={() => completeAppointment(item._id)}
                                            title='Mark Completed'
                                            className='w-8 h-8 rounded-lg bg-green-50 text-green-600 hover:bg-green-600 hover:text-white flex items-center justify-center transition-all text-sm'
                                        >✓</button>
                                        <button
                                            onClick={() => cancelAppointment(item._id)}
                                            title='Cancel'
                                            className='w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all text-sm'
                                        >✕</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    )
}

export default DoctorDashboard
