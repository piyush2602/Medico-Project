import React, { useContext } from 'react'
import { DoctorContext } from '../context/DoctorContext'
import { useNavigate } from 'react-router-dom'

const DoctorNavbar = () => {
    const { logoutDoctor, docProfile } = useContext(DoctorContext)
    const navigate = useNavigate()

    const handleLogout = () => {
        logoutDoctor()
        navigate('/')
    }

    return (
        <div className='flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white shadow-sm'>
            <div className='flex items-center gap-3'>
                {/* Logo text */}
                <span className='text-2xl font-bold text-primary tracking-tight'>Medico</span>
                <span className='border border-blue-400 text-blue-600 text-xs px-3 py-1 rounded-full font-semibold bg-blue-50'>
                    Doctor Portal
                </span>
            </div>

            <div className='flex items-center gap-4'>
                {docProfile && (
                    <div className='hidden sm:flex items-center gap-2'>
                        <img
                            src={docProfile.image}
                            alt={docProfile.name}
                            className='w-8 h-8 rounded-full object-cover border-2 border-primary/30'
                        />
                        <div className='text-right'>
                            <p className='text-sm font-semibold text-gray-700'>{docProfile.name}</p>
                            <p className='text-xs text-gray-400'>{docProfile.speciality}</p>
                        </div>
                    </div>
                )}
                <button
                    onClick={handleLogout}
                    className='bg-primary text-white text-sm px-6 py-2 rounded-full hover:bg-primary/90 transition-all duration-200 font-medium'
                >
                    Logout
                </button>
            </div>
        </div>
    )
}

export default DoctorNavbar
