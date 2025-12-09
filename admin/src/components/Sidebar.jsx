import React, { useContext } from 'react'
import { AdminContext } from '../context/AdminContext'
import { NavLink, useLocation } from 'react-router-dom'
import { assets } from '../assets/assets'

const Sidebar = () => {

    const { aToken } = useContext(AdminContext)
    const location = useLocation()
    const isVirtualMeet = location.pathname === '/virtual-meet'

    const navLinkClasses = `flex items-center gap-3 py-3.5 px-3 cursor-pointer ${isVirtualMeet ? 'md:px-3' : 'md:px-9 md:min-w-72'}`
    const textClasses = isVirtualMeet ? 'hidden' : 'hidden md:block'

    return (
        <div className='min-h-screen bg-white border-r'>
            {
                aToken && <ul className='text-[#515151] mt-5'>

                    <NavLink className={({ isActive }) => `${navLinkClasses} ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} to={'/admin-dashboard'}>
                        <img src={assets.home_icon} alt="" />
                        <p className={textClasses}>Dashboard</p>
                    </NavLink>

                    <NavLink className={({ isActive }) => `${navLinkClasses} ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} to={'/all-appointments'}>
                        <img src={assets.appointment_icon} alt="" />
                        <p className={textClasses}>Appointments</p>
                    </NavLink>

                    <NavLink className={({ isActive }) => `${navLinkClasses} ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} to={'/add-doctor'}>
                        <img src={assets.add_icon} alt="" />
                        <p className={textClasses}>Add Doctor</p>
                    </NavLink>

                    <NavLink className={({ isActive }) => `${navLinkClasses} ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} to={'/doctor-list'}>
                        <img src={assets.people_icon} alt="" />
                        <p className={textClasses}>Doctors List</p>
                    </NavLink>

                    <NavLink className={({ isActive }) => `${navLinkClasses} ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} to={'/virtual-meet'}>
                        <img src={assets.appointment_icon} alt="" />
                        <p className={textClasses}>Virtual Meet</p>
                    </NavLink>

                </ul>
            }
        </div>
    )
}

export default Sidebar
