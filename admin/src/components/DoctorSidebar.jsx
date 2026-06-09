import React, { useContext } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { DoctorContext } from '../context/DoctorContext'

const DoctorSidebar = () => {
    const { dToken } = useContext(DoctorContext)
    const location = useLocation()
    const isVirtualMeet = location.pathname === '/doctor-virtual-meet'

    if (!dToken) return null

    const navLinkClasses = `flex items-center gap-3 py-3.5 px-3 cursor-pointer transition-all duration-200 ${
        isVirtualMeet ? 'md:px-3' : 'md:px-9 md:min-w-72'
    }`
    const textClass = isVirtualMeet ? 'hidden' : 'hidden md:block'

    const linkClass = ({ isActive }) =>
        `${navLinkClasses} ${
            isActive
                ? 'bg-[#F2F3FF] border-r-4 border-primary text-primary font-semibold'
                : 'text-[#515151] hover:bg-gray-50'
        }`

    return (
        <div className='min-h-screen bg-white border-r shadow-sm'>
            <ul className='mt-5 text-[#515151]'>

                <NavLink className={linkClass} to='/doctor-dashboard'>
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                            d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' />
                    </svg>
                    <p className={textClass}>Dashboard</p>
                </NavLink>

                <NavLink className={linkClass} to='/doctor-appointments'>
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                            d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                    </svg>
                    <p className={textClass}>Appointments</p>
                </NavLink>

                <NavLink className={linkClass} to='/doctor-profile'>
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                            d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                    </svg>
                    <p className={textClass}>My Profile</p>
                </NavLink>

                <NavLink className={linkClass} to='/doctor-virtual-meet'>
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                            d='M15 10l4.553-2.069A1 1 0 0121 8.882v6.236a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' />
                    </svg>
                    <p className={textClass}>Virtual Meet</p>
                </NavLink>

            </ul>
        </div>
    )
}

export default DoctorSidebar
