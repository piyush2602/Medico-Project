import { createContext, useState, useEffect, useCallback } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';

export const AppContext = createContext()

const AppContextProvider = (props) => {

    const currencySymbol = 'Rs.'
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

    const [token, setToken] = useState(localStorage.getItem('token') || '')
    const [userData, setUserData] = useState(null)
    const [doctors, setDoctors] = useState([])

    // Get all doctors from backend
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    const slotDateFormat = (slotDate) => {
        if (!slotDate) return '';
        const dateArray = slotDate.split('_')
        if (dateArray.length !== 3) return slotDate
        return dateArray[0] + "/" + months[Number(dateArray[1]) - 1] + "/" + dateArray[2]
    }

    const getDoctors = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/doctor/list')
            if (data.success) {
                setDoctors(data.doctors)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    // Register user
    const register = async (name, email, password) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/user/register', { name, email, password })
            if (data.success) {
                localStorage.setItem('token', data.token)
                setToken(data.token)
                toast.success('Account created successfully!')
                return true
            } else {
                toast.error(data.message)
                return false
            }
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message || error.message)
            return false
        }
    }

    // Login user
    const login = async (email, password) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/user/login', { email, password })
            if (data.success) {
                localStorage.setItem('token', data.token)
                setToken(data.token)
                toast.success('Logged in successfully!')
                return true
            } else {
                toast.error(data.message)
                return false
            }
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message || error.message)
            return false
        }
    }

    // Logout user
    const logout = () => {
        setToken('')
        setUserData(null)
        localStorage.removeItem('token')
        toast.info('Logged out successfully')
    }

    // Load user profile data
    const loadUserData = useCallback(async () => {
        if (!token) {
            return
        }

        try {
            const { data } = await axios.get(backendUrl + '/api/user/get-profile', { headers: { token } })
            if (data.success) {
                setUserData(data.userData)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message || error.message)
        }
    }, [token, backendUrl])

    // Update user profile with image support
    const updateProfile = async (name, phone, address, dob, gender, image) => {
        try {
            const formData = new FormData()
            formData.append('name', name)
            formData.append('phone', phone)
            formData.append('address', JSON.stringify(address))
            formData.append('dob', dob)
            formData.append('gender', gender)

            if (image) {
                formData.append('image', image)
            }

            const { data } = await axios.post(backendUrl + '/api/user/update-profile', formData, { headers: { token } })
            if (data.success) {
                toast.success('Profile updated successfully!')
                await loadUserData()
                return true
            } else {
                toast.error(data.message)
                return false
            }
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message || error.message)
            return false
        }
    }

    // Book appointment
    const bookAppointment = async (docId, slotDate, slotTime) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/user/book-appointment', { docId, slotDate, slotTime }, { headers: { token } })
            if (data.success) {
                toast.success(data.message)
                return true
            } else {
                toast.error(data.message)
                return false
            }
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message || error.message)
            return false
        }
    }

    // Load user data when token changes
    useEffect(() => {
        if (token) {
            loadUserData()
        } else {
            setUserData(null)
        }
    }, [token, loadUserData])

    // Load doctors on mount
    useEffect(() => {
        getDoctors()
    }, [])

    const value = {
        doctors,
        getDoctors,
        currencySymbol,
        token,
        setToken,
        backendUrl,
        userData,
        setUserData,
        register,
        login,
        logout,
        loadUserData,
        updateProfile,
        bookAppointment,
        slotDateFormat
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider