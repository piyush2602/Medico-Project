import React, { useState, useContext, useEffect } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'

const FILTERS = ['All', 'Appointment', 'Prescription', 'Certificate', 'Message', 'System']

const typeConfig = {
  Appointment: {
    icon: (
      <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
      </svg>
    ),
    bg: 'bg-indigo-100', text: 'text-indigo-600', dot: 'bg-indigo-500',
    badge: 'bg-indigo-100 text-indigo-700',
  },
  Prescription: {
    icon: (
      <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
      </svg>
    ),
    bg: 'bg-purple-100', text: 'text-purple-600', dot: 'bg-purple-500',
    badge: 'bg-purple-100 text-purple-700',
  },
  System: {
    icon: (
      <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
      </svg>
    ),
    bg: 'bg-blue-100', text: 'text-blue-600', dot: 'bg-blue-500',
    badge: 'bg-blue-100 text-blue-700',
  },
  Certificate: {
    icon: (
      <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' />
      </svg>
    ),
    bg: 'bg-emerald-100', text: 'text-emerald-600', dot: 'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700',
  },
  Message: {
    icon: (
      <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' />
      </svg>
    ),
    bg: 'bg-teal-100', text: 'text-teal-600', dot: 'bg-teal-500',
    badge: 'bg-teal-100 text-teal-700',
  },
}

// ─── Derive notifications from appointments ────────────────────────────────────
const buildNotifications = (appointments, slotDateFormat) => {
  const list = []
  appointments.forEach(appt => {
    const docName = appt.docData?.name || 'Your Doctor'
    const date = slotDateFormat ? slotDateFormat(appt.slotDate) : appt.slotDate
    const time = appt.slotTime

    if (appt.isCompleted) {
      list.push({
        id: `${appt._id}-completed`,
        type: 'Appointment',
        title: 'Appointment Completed',
        message: `Your appointment with ${docName} on ${date} at ${time} has been completed.`,
        time: date,
        read: true,
      })
    } else if (appt.cancelled) {
      list.push({
        id: `${appt._id}-cancelled`,
        type: 'Appointment',
        title: 'Appointment Cancelled',
        message: `Your appointment with ${docName} on ${date} at ${time} was cancelled.`,
        time: date,
        read: true,
      })
    } else {
      list.push({
        id: `${appt._id}-upcoming`,
        type: 'Appointment',
        title: 'Upcoming Appointment',
        message: `You have an appointment with ${docName} on ${date} at ${time}. Please be on time.`,
        time: date,
        read: false,
      })
    }

    if (appt.prescription) {
      list.push({
        id: `${appt._id}-rx`,
        type: 'Prescription',
        title: 'Prescription Ready',
        message: `${docName} has issued a prescription for your appointment on ${date}. View it in My Appointments.`,
        time: date,
        read: false,
      })
    }

    if (appt.medicalCertificate) {
      const fitStatus = appt.medicalCertificate.fitForDuty
      const statusText = fitStatus === true ? 'Fit for duty' : fitStatus === false ? 'Unfit – rest advised' : ''
      list.push({
        id: `${appt._id}-cert`,
        type: 'Certificate',
        title: 'Medical Certificate Issued',
        message: `${docName} has issued a medical certificate for your appointment on ${date}${statusText ? ` — ${statusText}` : ''}. View it in My Appointments.`,
        time: date,
        read: false,
      })
    }

    if (appt.unreadCount > 0) {
      list.push({
        id: `${appt._id}-msg`,
        type: 'Message',
        title: 'New Message from Doctor',
        message: `${docName} sent you ${appt.unreadCount} new message${appt.unreadCount > 1 ? 's' : ''}. Open chat in My Appointments.`,
        time: date,
        read: false,
      })
    }
  })

  // Add static system notifications
  list.push({
    id: 'sys-welcome',
    type: 'System',
    title: 'Welcome to Medico! 🎉',
    message: 'Thank you for choosing Medico. Book appointments, chat with doctors, and manage your health all in one place.',
    time: 'Today',
    read: true,
  })
  list.push({
    id: 'sys-payment',
    type: 'System',
    title: 'Online Payments Coming Soon 💳',
    message: 'We are working hard to bring you seamless online payment support — cards, UPI, net banking and wallets.',
    time: 'Today',
    read: true,
  })

  return list
}

// ─── Notification Card ─────────────────────────────────────────────────────────
const NotifCard = ({ notif, onMarkRead }) => {
  const cfg = typeConfig[notif.type] || typeConfig.System
  return (
    <div
      className={`relative flex gap-4 p-4 sm:p-5 rounded-2xl border transition-all duration-200 hover:shadow-md group ${
        notif.read
          ? 'bg-white border-gray-100'
          : 'bg-indigo-50/40 border-indigo-100 shadow-sm'
      }`}
    >
      {/* Unread dot */}
      {!notif.read && (
        <span className={`absolute top-4 right-4 w-2.5 h-2.5 rounded-full ${cfg.dot} ring-2 ring-white`} />
      )}

      {/* Icon */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${cfg.bg} ${cfg.text}`}>
        {cfg.icon}
      </div>

      {/* Content */}
      <div className='flex-1 min-w-0'>
        <div className='flex items-start justify-between gap-2 flex-wrap'>
          <div>
            <p className={`text-sm font-semibold ${notif.read ? 'text-gray-700' : 'text-gray-900'}`}>
              {notif.title}
            </p>
            <span className={`inline-block mt-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}>
              {notif.type}
            </span>
          </div>
          <span className='text-xs text-gray-400 whitespace-nowrap mt-0.5'>{notif.time}</span>
        </div>
        <p className='text-xs text-gray-500 mt-1.5 leading-relaxed pr-4'>{notif.message}</p>

        {!notif.read && (
          <button
            onClick={() => onMarkRead(notif.id)}
            className='mt-2 text-xs text-indigo-500 hover:text-indigo-700 font-semibold transition-colors'
          >
            Mark as read
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────
const Notifications = () => {
  const { backendUrl, token, slotDateFormat } = useContext(AppContext)
  const [appointments, setAppointments] = useState([])
  const [filter, setFilter] = useState('All')
  const [readIds, setReadIds] = useState(() => {
    const saved = localStorage.getItem('medico_read_notifications')
    return saved ? new Set(JSON.parse(saved)) : new Set()
  })

  useEffect(() => {
    localStorage.setItem('medico_read_notifications', JSON.stringify(Array.from(readIds)))
  }, [readIds])
  useEffect(() => {
    if (!token) return
    axios.get(`${backendUrl}/api/user/appointments`, { headers: { token } })
      .then(({ data }) => { if (data.success) setAppointments(data.appointments.reverse()) })
      .catch(console.error)
  }, [token])

  const allNotifs = buildNotifications(appointments, slotDateFormat).map(n => ({
    ...n,
    read: n.read || readIds.has(n.id),
  }))

  const filtered = filter === 'All' ? allNotifs : allNotifs.filter(n => n.type === filter)
  const unreadCount = allNotifs.filter(n => !n.read).length

  const markRead = (id) => setReadIds(prev => new Set([...prev, id]))
  const markAllRead = () => setReadIds(new Set(allNotifs.map(n => n.id)))

  return (
    <div className='max-w-2xl mx-auto py-10 px-2'>

      {/* Header */}
      <div className='flex items-start justify-between mb-8'>
        <div>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-2xl flex items-center justify-center' style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
              <svg className='w-5 h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' />
              </svg>
            </div>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>Notifications</h1>
              <p className='text-sm text-gray-400'>
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className='flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all'
          >
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
            </svg>
            Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className='flex gap-2 flex-wrap mb-6'>
        {FILTERS.map(f => {
          const count = f === 'All' ? allNotifs.length : allNotifs.filter(n => n.type === f).length
          const unread = f === 'All' ? unreadCount : allNotifs.filter(n => n.type === f && !n.read).length
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                filter === f
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-indigo-400 hover:text-indigo-600'
              }`}
            >
              {f}
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                filter === f ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}>{count}</span>
              {unread > 0 && (
                <span className='w-2 h-2 rounded-full bg-red-500' />
              )}
            </button>
          )
        })}
      </div>

      {/* Notification list */}
      {filtered.length === 0 ? (
        <div className='text-center py-24'>
          <div className='text-6xl mb-4'>🔔</div>
          <p className='text-gray-500 font-semibold'>No notifications here</p>
          <p className='text-sm text-gray-400 mt-1'>Check back later for updates.</p>
        </div>
      ) : (
        <>
          {/* Unread group */}
          {filtered.some(n => !n.read) && (
            <div className='mb-6'>
              <p className='text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2'>
                <span className='w-2 h-2 rounded-full bg-indigo-500 animate-pulse inline-block' />
                Unread
              </p>
              <div className='flex flex-col gap-3'>
                {filtered.filter(n => !n.read).map(n => (
                  <NotifCard key={n.id} notif={n} onMarkRead={markRead} />
                ))}
              </div>
            </div>
          )}

          {/* Read group */}
          {filtered.some(n => n.read) && (
            <div>
              <p className='text-xs font-bold text-gray-400 uppercase tracking-widest mb-3'>Earlier</p>
              <div className='flex flex-col gap-3'>
                {filtered.filter(n => n.read).map(n => (
                  <NotifCard key={n.id} notif={n} onMarkRead={markRead} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Notifications
