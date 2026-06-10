import { createContext, useState } from "react"
import axios from 'axios'
import { toast } from 'react-toastify'

export const DoctorContext = createContext()

const DoctorContextProvider = (props) => {
    const [dToken, setDToken] = useState(localStorage.getItem('dToken') || '')
    const [appointments, setAppointments] = useState([])
    const [docProfile, setDocProfile] = useState(null)
    const [dashData, setDashData] = useState(null)

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

    // ── Login ──────────────────────────────────────────────────────────────────
    const loginDoctor = async (email, password) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/doctor/login', { email, password })
            if (data.success) {
                localStorage.setItem('dToken', data.token)
                setDToken(data.token)
                toast.success('Welcome back, Doctor!')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // ── Logout ─────────────────────────────────────────────────────────────────
    const logoutDoctor = () => {
        localStorage.removeItem('dToken')
        setDToken('')
        setAppointments([])
        setDocProfile(null)
        setDashData(null)
    }

    // ── Get Appointments ───────────────────────────────────────────────────────
    const getDocAppointments = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/doctor/appointments', {
                headers: { dtoken: dToken }
            })
            if (data.success) {
                setAppointments(data.appointments)
                computeDashData(data.appointments)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // ── Compute dash stats from appointments array ──────────────────────────────
    const computeDashData = (appts) => {
        const total = appts.length
        const completed = appts.filter(a => a.isCompleted).length
        const cancelled = appts.filter(a => a.cancelled).length
        const pending = appts.filter(a => !a.isCompleted && !a.cancelled).length
        const latest = [...appts].slice(0, 8)
        setDashData({ total, completed, cancelled, pending, latest })
    }

    // ── Cancel Appointment ─────────────────────────────────────────────────────
    const cancelAppointment = async (appointmentId) => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/doctor/cancel-appointment',
                { appointmentId },
                { headers: { dtoken: dToken } }
            )
            if (data.success) {
                toast.success(data.message)
                getDocAppointments()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // ── Complete Appointment ───────────────────────────────────────────────────
    const completeAppointment = async (appointmentId) => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/doctor/complete-appointment',
                { appointmentId },
                { headers: { dtoken: dToken } }
            )
            if (data.success) {
                toast.success(data.message)
                getDocAppointments()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // ── Save Prescription ──────────────────────────────────────────────────────
    const savePrescription = async (appointmentId, prescription) => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/doctor/save-prescription',
                { appointmentId, prescription },
                { headers: { dtoken: dToken } }
            )
            if (data.success) {
                toast.success(data.message)
                getDocAppointments()
                return true
            } else {
                toast.error(data.message)
                return false
            }
        } catch (error) {
            toast.error(error.message)
            return false
        }
    }

    // ── Get Doctor Profile ─────────────────────────────────────────────────────
    const getDocProfile = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/doctor/profile', {
                headers: { dtoken: dToken }
            })
            if (data.success) {
                setDocProfile(data.docData)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // ── Send Custom Email to Patient ───────────────────────────────────────────
    const sendEmailToPatient = async (appointmentId, subject, message) => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/doctor/send-email',
                { appointmentId, subject, message },
                { headers: { dtoken: dToken } }
            )
            if (data.success) {
                toast.success('Email sent to patient!')
                return true
            } else {
                toast.error(data.message)
                return false
            }
        } catch (error) {
            toast.error(error.message)
            return false
        }
    }

    const value = {
        dToken, setDToken,
        backendUrl,
        appointments, setAppointments,
        dashData,
        docProfile,
        loginDoctor, logoutDoctor,
        getDocAppointments,
        cancelAppointment, completeAppointment,
        savePrescription,
        getDocProfile,
        sendEmailToPatient
    }

    return (
        <DoctorContext.Provider value={value}>
            {props.children}
        </DoctorContext.Provider>
    )
}

export default DoctorContextProvider
