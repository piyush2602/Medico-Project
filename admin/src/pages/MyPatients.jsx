import React, { useContext, useEffect, useMemo, useState } from 'react'
import { AdminContext } from '../context/AdminContext'
import { AppContext } from '../context/AppContext'

const MyPatients = () => {
    const { aToken, appointments, getAllAppointments } = useContext(AdminContext)
    const { slotDateFormat } = useContext(AppContext)
    const [search, setSearch] = useState('')

    useEffect(() => {
        if (aToken) getAllAppointments()
    }, [aToken])

    // Derive unique patients from appointments
    const patients = useMemo(() => {
        const seen = new Set()
        const list = []
        appointments.forEach(appt => {
            const uid = appt.userData?._id || appt.userId
            if (uid && !seen.has(uid)) {
                seen.add(uid)
                // collect all appointments for this patient
                const patientAppts = appointments.filter(a => (a.userData?._id || a.userId) === uid)
                const lastAppt = patientAppts[0] // appointments are already sorted desc
                const totalSpent = patientAppts.reduce((sum, a) => sum + (a.amount || 0), 0)
                const pending = patientAppts.filter(a => !a.cancelled && !a.isCompleted).length
                const completed = patientAppts.filter(a => a.isCompleted).length
                const cancelled = patientAppts.filter(a => a.cancelled).length
                list.push({
                    ...appt.userData,
                    uid,
                    totalAppts: patientAppts.length,
                    totalSpent,
                    pending,
                    completed,
                    cancelled,
                    lastDoctor: lastAppt?.docData?.name,
                    lastDate: lastAppt?.slotDate,
                    lastTime: lastAppt?.slotTime,
                })
            }
        })
        return list
    }, [appointments])

    const filtered = patients.filter(p =>
        !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.email?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className='p-6'>
            {/* Header */}
            <div className='mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                <div>
                    <h2 className='text-2xl font-bold text-gray-800'>My Patients</h2>
                    <p className='text-sm text-gray-400 mt-1'>All unique patients who have booked appointments — {patients.length} total.</p>
                </div>
                {/* Search */}
                <div className='relative max-w-xs w-full'>
                    <svg className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z' />
                    </svg>
                    <input
                        type='text'
                        placeholder='Search by name or email…'
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className='w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white'
                    />
                </div>
            </div>

            {/* Stats row */}
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6'>
                {[
                    { label: 'Total Patients', value: patients.length, icon: '👥', color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Total Appointments', value: appointments.length, icon: '📅', color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Completed', value: appointments.filter(a => a.isCompleted).length, icon: '✅', color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Pending', value: appointments.filter(a => !a.cancelled && !a.isCompleted).length, icon: '⏳', color: 'text-amber-600', bg: 'bg-amber-50' },
                ].map(s => (
                    <div key={s.label} className={`flex items-center gap-3 p-4 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all cursor-default`}>
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${s.bg}`}>{s.icon}</div>
                        <div>
                            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                            <p className='text-xs text-gray-400 font-medium'>{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Patient Cards Grid */}
            {filtered.length === 0 ? (
                <div className='bg-white rounded-2xl border border-gray-100 px-6 py-16 text-center'>
                    <div className='text-5xl mb-4'>🔍</div>
                    <p className='text-gray-500 font-medium'>No patients found{search ? ` for "${search}"` : ''}</p>
                </div>
            ) : (
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {filtered.map((patient, idx) => (
                        <div
                            key={patient.uid || idx}
                            className='bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-5 flex flex-col gap-4'
                        >
                            {/* Patient Info */}
                            <div className='flex items-center gap-3'>
                                <img
                                    src={patient.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(patient.name || 'P')}&background=6366f1&color=fff&size=80`}
                                    alt={patient.name}
                                    className='w-14 h-14 rounded-xl object-cover border border-gray-100 flex-shrink-0'
                                />
                                <div className='min-w-0'>
                                    <p className='font-bold text-gray-800 truncate'>{patient.name}</p>
                                    <p className='text-xs text-gray-400 truncate'>{patient.email}</p>
                                    <div className='flex items-center gap-2 mt-1'>
                                        {patient.gender && (
                                            <span className='text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full'>{patient.gender}</span>
                                        )}
                                        {patient.age && (
                                            <span className='text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full'>Age {patient.age}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Stats row */}
                            <div className='grid grid-cols-3 gap-2 text-center'>
                                <div className='bg-indigo-50 rounded-xl py-2'>
                                    <p className='text-lg font-bold text-indigo-600'>{patient.totalAppts}</p>
                                    <p className='text-[10px] text-gray-500 font-medium'>Total</p>
                                </div>
                                <div className='bg-green-50 rounded-xl py-2'>
                                    <p className='text-lg font-bold text-green-600'>{patient.completed}</p>
                                    <p className='text-[10px] text-gray-500 font-medium'>Completed</p>
                                </div>
                                <div className='bg-amber-50 rounded-xl py-2'>
                                    <p className='text-lg font-bold text-amber-600'>{patient.pending}</p>
                                    <p className='text-[10px] text-gray-500 font-medium'>Pending</p>
                                </div>
                            </div>

                            {/* Last Appointment */}
                            {patient.lastDate && (
                                <div className='border-t border-gray-50 pt-3 flex items-center justify-between'>
                                    <div>
                                        <p className='text-xs text-gray-400'>Last appointment</p>
                                        <p className='text-xs font-semibold text-gray-700'>{slotDateFormat(patient.lastDate)} · {patient.lastTime}</p>
                                        {patient.lastDoctor && (
                                            <p className='text-xs text-gray-400 truncate'>with {patient.lastDoctor}</p>
                                        )}
                                    </div>
                                    <div className='text-right'>
                                        <p className='text-xs text-gray-400'>Total spent</p>
                                        <p className='text-sm font-bold text-gray-700'>₹{patient.totalSpent}</p>
                                    </div>
                                </div>
                            )}

                            {/* Contact */}
                            {patient.phone && (
                                <div className='flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2'>
                                    <svg className='w-3.5 h-3.5 text-gray-400 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                                    </svg>
                                    <span>{patient.phone}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default MyPatients
