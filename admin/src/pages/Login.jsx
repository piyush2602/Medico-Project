import React, { useContext, useState } from 'react'
import { AdminContext } from '../context/AdminContext'
import { DoctorContext } from '../context/DoctorContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const Login = () => {
  const [state, setState] = useState('Admin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const { setAToken, backendUrl } = useContext(AdminContext)
  const { loginDoctor } = useContext(DoctorContext)

  const onSubmitHandler = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      if (state === 'Admin') {
        const { data } = await axios.post(backendUrl + '/api/admin/login', { email, password })
        if (data.success) {
          localStorage.setItem('aToken', data.token)
          setAToken(data.token)
          toast.success('Welcome, Admin!')
        } else {
          toast.error(data.message)
        }
      } else {
        // Doctor login via DoctorContext
        await loginDoctor(email, password)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4'>

      {/* Decorative blobs */}
      <div className='absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none'></div>
      <div className='absolute bottom-0 right-0 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none'></div>

      <form onSubmit={onSubmitHandler} className='relative bg-white rounded-3xl shadow-2xl shadow-indigo-200/40 w-full max-w-md p-8 sm:p-10'>

        {/* Logo */}
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-primary tracking-tight'>Medico</h1>
          <p className='text-gray-400 text-sm mt-1'>Digital Healthcare Platform</p>
        </div>

        {/* Role Toggle */}
        <div className='flex rounded-xl bg-gray-100 p-1 mb-8'>
          {['Admin', 'Doctor'].map(role => (
            <button
              key={role}
              type='button'
              onClick={() => { setState(role); setEmail(''); setPassword('') }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                state === role
                  ? 'bg-white text-primary shadow-md shadow-indigo-100'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >{role} Login</button>
          ))}
        </div>

        {/* Title */}
        <div className='mb-6'>
          <h2 className='text-2xl font-bold text-gray-800'>
            {state === 'Admin' ? '👋 Admin Portal' : '🩺 Doctor Portal'}
          </h2>
          <p className='text-sm text-gray-400 mt-1'>
            {state === 'Admin' ? 'Sign in to manage your platform' : 'Sign in with your registered credentials'}
          </p>
        </div>

        {/* Email */}
        <div className='mb-4'>
          <label className='block text-sm font-semibold text-gray-600 mb-1.5'>Email Address</label>
          <input
            id='login-email'
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            className='w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-gray-50 focus:bg-white'
            type='email'
            placeholder='you@example.com'
            required
          />
        </div>

        {/* Password */}
        <div className='mb-6'>
          <label className='block text-sm font-semibold text-gray-600 mb-1.5'>Password</label>
          <input
            id='login-password'
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            className='w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-gray-50 focus:bg-white'
            type='password'
            placeholder='Enter your password'
            required
          />
        </div>

        {/* Submit */}
        <button
          id='login-submit'
          type='submit'
          disabled={loading}
          className='w-full bg-primary text-white py-3 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 disabled:opacity-70 flex items-center justify-center gap-2'
        >
          {loading ? (
            <><svg className='animate-spin w-4 h-4' fill='none' viewBox='0 0 24 24'><circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle><path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'></path></svg> Signing in...</>
          ) : `Sign in as ${state}`}
        </button>

        <p className='text-xs text-gray-400 text-center mt-6'>
          {state === 'Doctor' ? 'Your credentials are managed by the administrator.' : 'Admin access is restricted to authorized personnel.'}
        </p>

      </form>
    </div>
  )
}

export default Login
