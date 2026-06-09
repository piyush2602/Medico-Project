import React, { useContext, useEffect } from 'react'
import { DoctorContext } from '../../context/DoctorContext'

const InfoRow = ({ label, value }) => (
    <div className='flex flex-col sm:flex-row sm:items-center gap-1 py-3 border-b border-gray-50 last:border-0'>
        <span className='text-xs font-semibold text-gray-400 uppercase tracking-wide w-36 flex-shrink-0'>{label}</span>
        <span className='text-sm text-gray-700 font-medium'>{value || '—'}</span>
    </div>
)

const DoctorProfile = () => {
    const { dToken, docProfile, getDocProfile } = useContext(DoctorContext)

    useEffect(() => {
        if (dToken) getDocProfile()
    }, [dToken])

    if (!docProfile) {
        return (
            <div className='flex items-center justify-center h-[60vh]'>
                <div className='text-center'>
                    <div className='w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
                    <p className='text-gray-500'>Loading profile...</p>
                </div>
            </div>
        )
    }

    return (
        <div className='p-6'>
            <div className='mb-5'>
                <h2 className='text-2xl font-bold text-gray-800'>My Profile</h2>
                <p className='text-sm text-gray-400 mt-1'>Your professional details as registered by the admin.</p>
            </div>

            <div className='max-w-3xl grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6'>

                {/* Profile Card */}
                <div className='bg-gradient-to-b from-primary to-indigo-600 rounded-2xl p-6 text-white text-center flex flex-col items-center gap-3 shadow-lg shadow-primary/20 w-full lg:w-60'>
                    <div className='relative'>
                        <img
                            src={docProfile.image}
                            alt={docProfile.name}
                            className='w-28 h-28 rounded-2xl object-cover border-4 border-white/30 shadow-md'
                        />
                        <span className={`absolute -bottom-2 -right-2 w-5 h-5 rounded-full border-2 border-white ${docProfile.available ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                    </div>
                    <div>
                        <h3 className='text-xl font-bold'>{docProfile.name}</h3>
                        <p className='text-indigo-200 text-sm mt-1'>{docProfile.speciality}</p>
                        <span className={`mt-2 inline-block text-xs px-3 py-1 rounded-full font-semibold ${docProfile.available ? 'bg-green-400/20 text-green-200' : 'bg-gray-400/20 text-gray-200'}`}>
                            {docProfile.available ? 'Available' : 'Not Available'}
                        </span>
                    </div>
                    <div className='w-full pt-3 border-t border-white/20 text-sm text-indigo-200'>
                        <p className='font-semibold text-white text-lg'>₹{docProfile.fees}</p>
                        <p className='text-xs'>Consultation Fee</p>
                    </div>
                </div>

                {/* Info Panel */}
                <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6'>
                    <h4 className='font-semibold text-gray-700 mb-4 flex items-center gap-2'>
                        <svg className='w-4 h-4 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                        </svg>
                        Professional Information
                    </h4>
                    <div className='divide-y divide-gray-50'>
                        <InfoRow label='Full Name' value={docProfile.name} />
                        <InfoRow label='Email' value={docProfile.email} />
                        <InfoRow label='Speciality' value={docProfile.speciality} />
                        <InfoRow label='Degree' value={docProfile.degree} />
                        <InfoRow label='Experience' value={docProfile.experience} />
                    </div>

                    <h4 className='font-semibold text-gray-700 mt-6 mb-4 flex items-center gap-2'>
                        <svg className='w-4 h-4 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                        </svg>
                        Address
                    </h4>
                    <div className='divide-y divide-gray-50'>
                        <InfoRow label='Line 1' value={docProfile.address?.line1} />
                        <InfoRow label='Line 2' value={docProfile.address?.line2} />
                    </div>

                    <h4 className='font-semibold text-gray-700 mt-6 mb-3 flex items-center gap-2'>
                        <svg className='w-4 h-4 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                        </svg>
                        About
                    </h4>
                    <p className='text-sm text-gray-600 leading-relaxed'>{docProfile.about}</p>
                </div>

            </div>
        </div>
    )
}

export default DoctorProfile
