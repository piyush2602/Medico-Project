import React, { useContext } from 'react'
import Login from './pages/Login'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AdminContext } from './context/AdminContext'
import { DoctorContext } from './context/DoctorContext'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import DoctorNavbar from './components/DoctorNavbar'
import DoctorSidebar from './components/DoctorSidebar'
import { Route, Routes, useLocation } from 'react-router-dom'
// Admin pages
import Dashboard from './pages/Dashboard'
import AllAppointments from './pages/AllAppointments'
import AddDoctor from './pages/AddDoctor'
import DoctorsList from './pages/DoctorsList'
import VirtualMeet from './pages/VirtualMeet'
// Doctor pages
import DoctorDashboard from './pages/doctor/DoctorDashboard'
import DoctorAppointments from './pages/doctor/DoctorAppointments'
import DoctorProfile from './pages/doctor/DoctorProfile'
import SendMeeting from './pages/doctor/SendMeeting'

const App = () => {
  const { aToken } = useContext(AdminContext)
  const { dToken } = useContext(DoctorContext)
  const location = useLocation()

  // ── Doctor portal ──────────────────────────────────────────────────────────
  const isDocVirtualMeet = location.pathname === '/doctor-virtual-meet'

  if (dToken) {
    return (
      <div className='bg-[#F8F9FD] min-h-screen'>
        <ToastContainer position='top-right' autoClose={3000} />
        {!isDocVirtualMeet && <DoctorNavbar />}
        <div className='flex items-start'>
          <DoctorSidebar />
          <div className='flex-1 overflow-auto'>
            <Routes>
              <Route path='/' element={<></>} />
              <Route path='/doctor-dashboard' element={<DoctorDashboard />} />
              <Route path='/doctor-appointments' element={<DoctorAppointments />} />
              <Route path='/doctor-today-appointments' element={<DoctorAppointments isToday={true} />} />
              <Route path='/doctor-profile' element={<DoctorProfile />} />
              <Route path='/doctor-virtual-meet' element={<VirtualMeet />} />
              <Route path='/doctor-send-meeting' element={<SendMeeting />} />
              {/* Fallback: redirect all unknown paths to doctor dashboard */}
              <Route path='*' element={<DoctorDashboard />} />
            </Routes>
          </div>
        </div>
      </div>
    )
  }

  // ── Admin portal ───────────────────────────────────────────────────────────
  if (aToken) {
    return (
      <div className='bg-[#F8F9FD] min-h-screen'>
        <ToastContainer position='top-right' autoClose={3000} />
        {location.pathname !== '/virtual-meet' && <Navbar />}
        <div className='flex items-start'>
          <Sidebar />
          <div className='flex-1 overflow-auto'>
            <Routes>
              <Route path='/' element={<></>} />
              <Route path='/admin-dashboard' element={<Dashboard />} />
              <Route path='/all-appointments' element={<AllAppointments />} />
              <Route path='/add-doctor' element={<AddDoctor />} />
              <Route path='/doctor-list' element={<DoctorsList />} />
              <Route path='/virtual-meet' element={<VirtualMeet />} />
            </Routes>
          </div>
        </div>
      </div>
    )
  }

  // ── Not logged in ──────────────────────────────────────────────────────────
  return (
    <>
      <Login />
      <ToastContainer position='top-right' autoClose={3000} />
    </>
  )
}

export default App
