import React, { useContext, useEffect, useState, useCallback } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { jsPDF } from 'jspdf'
import ChatModal from '../components/ChatModal'
import EmailModal from '../components/EmailModal'
import CertificateDocument, { getCertNumber } from '../components/CertificateDocument'




// ─── Shared PDF builder ────────────────────────────────────────────────────────
const buildPrescriptionDoc = (item, slotDateFormat) => {
  const rx = item.prescription
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  let y = 0

  // Header band
  doc.setFillColor(79, 70, 229)
  doc.rect(0, 0, W, 38, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('Medico', 15, 18)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Digital Healthcare Platform', 15, 26)

  // Doctor info
  const d = item.docData
  doc.setFont('helvetica', 'bold').setFontSize(12)
  doc.text(d.name, W - 15, 16, { align: 'right' })
  doc.setFont('helvetica', 'normal').setFontSize(9)
  doc.text(`${d.speciality} | ${d.degree}`, W - 15, 23, { align: 'right' })
  doc.text(`Exp: ${d.experience}`, W - 15, 29, { align: 'right' })

  y = 50

  // Patient Info box
  const hasWeight = !!rx.patientWeight
  const patBoxH = hasWeight ? 34 : 28
  doc.setFillColor(245, 247, 255)
  doc.roundedRect(12, y, W - 24, patBoxH, 3, 3, 'F')
  doc.setTextColor(60, 60, 80).setFont('helvetica', 'bold').setFontSize(10)
  doc.text('PATIENT INFORMATION', 18, y + 8)
  doc.setFont('helvetica', 'normal').setFontSize(9)
  const pat = item.userData
  doc.text(`Name: ${pat?.name || 'N/A'}`, 18, y + 16)
  doc.text(`Date: ${slotDateFormat ? slotDateFormat(item.slotDate) : item.slotDate} | Time: ${item.slotTime}`, 18, y + 23)
  doc.text(`Phone: ${pat?.phone || 'N/A'}`, W / 2 + 10, y + 16)
  doc.text(`Gender: ${pat?.gender || 'N/A'}`, W / 2 + 10, y + 23)
  if (hasWeight) doc.text(`Weight: ${rx.patientWeight} kg`, 18, y + 30)
  y += patBoxH + 8

  // Prescription Title
  doc.setFont('helvetica', 'bold').setFontSize(12).setTextColor(79, 70, 229)
  doc.text('PRESCRIPTION', 15, y)
  doc.setDrawColor(79, 70, 229).setLineWidth(0.5)
  doc.line(15, y + 2, W - 15, y + 2)
  y += 10

  // Diagnosed Disease
  if (rx.diagnosedDisease) {
    doc.setFillColor(255, 243, 230)
    doc.roundedRect(12, y, W - 24, 10, 2, 2, 'F')
    doc.setFont('helvetica', 'bold').setFontSize(9).setTextColor(180, 80, 20)
    doc.text('Diagnosis:', 16, y + 6.5)
    doc.setFont('helvetica', 'normal').setTextColor(100, 40, 10)
    doc.text(rx.diagnosedDisease, 38, y + 6.5)
    y += 14
  }

  // Medicines Table
  if (rx.medicines && rx.medicines.length > 0) {
    doc.setFillColor(79, 70, 229).setTextColor(255, 255, 255)
    doc.rect(12, y, W - 24, 8, 'F')
    doc.setFontSize(8.5).setFont('helvetica', 'bold')
    const cols = [14, 70, 110, 145, 175]
    ;['Medicine Name', 'Dosage', 'Frequency', 'Duration'].forEach((h, i) => doc.text(h, cols[i], y + 5.5))
    y += 8

    rx.medicines.forEach((med, idx) => {
      doc.setFillColor(...(idx % 2 === 0 ? [255, 255, 255] : [248, 249, 255]))
      doc.rect(12, y, W - 24, 8, 'F')
      doc.setTextColor(50, 50, 70).setFont('helvetica', 'normal').setFontSize(8.5)
      doc.text(med.name || '', cols[0], y + 5.5)
      doc.text(med.dosage || '', cols[1], y + 5.5)
      doc.text(med.frequency || '', cols[2], y + 5.5)
      doc.text(med.duration || '', cols[3], y + 5.5)
      y += 8
    })
    doc.setDrawColor(200, 200, 220).setLineWidth(0.3)
    doc.rect(12, y - 8 * (rx.medicines.length + 1), W - 24, 8 * (rx.medicines.length + 1))
    y += 8
  }

  if (rx.instructions) {
    doc.setFont('helvetica', 'bold').setFontSize(10).setTextColor(79, 70, 229)
    doc.text('Instructions', 15, y)
    y += 6
    doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(60, 60, 80)
    const lines = doc.splitTextToSize(rx.instructions, W - 30)
    doc.text(lines, 15, y)
    y += lines.length * 5 + 4
  }

  if (rx.followUpDate) {
    doc.setFont('helvetica', 'bold').setFontSize(10).setTextColor(79, 70, 229)
    doc.text('Follow-up Date:', 15, y)
    doc.setFont('helvetica', 'normal').setTextColor(60, 60, 80)
    doc.text(rx.followUpDate, 55, y)
    y += 10
  }

  if (rx.notes) {
    doc.setFont('helvetica', 'bold').setFontSize(10).setTextColor(79, 70, 229)
    doc.text('Notes', 15, y)
    y += 6
    doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(60, 60, 80)
    const noteLines = doc.splitTextToSize(rx.notes, W - 30)
    doc.text(noteLines, 15, y)
    y += noteLines.length * 5 + 4
  }

  // Signature
  const sigY = Math.max(y + 20, 240)
  doc.setDrawColor(180, 180, 200).setLineWidth(0.4)
  doc.line(W - 75, sigY, W - 15, sigY)
  // Doctor name above line
  if (d?.name) {
    doc.setFont('helvetica', 'bold').setFontSize(9).setTextColor(60, 60, 80)
    doc.text(d.name, W - 45, sigY - 4, { align: 'center' })
  }
  // Label below line
  doc.setFont('helvetica', 'normal').setFontSize(7.5).setTextColor(120, 120, 140)
  doc.text("Doctor's Signature", W - 45, sigY + 4.5, { align: 'center' })

  // Footer
  doc.setFillColor(245, 247, 255)
  doc.rect(0, 285, W, 12, 'F')
  doc.setFontSize(7.5).setTextColor(130, 130, 150)
  doc.text('This prescription is computer-generated by Medico Digital Healthcare Platform.', W / 2, 291, { align: 'center' })
  doc.text('Please consult your doctor for any queries.', W / 2, 295.5, { align: 'center' })

  return doc
}

// ─── Prescription Preview Modal ────────────────────────────────────────────────
const PrescriptionPreviewModal = ({ item, onClose, slotDateFormat }) => {
  const [pdfUrl, setPdfUrl] = useState(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const doc = buildPrescriptionDoc(item, slotDateFormat)
    const url = doc.output('bloburl')
    setPdfUrl(url)
    return () => {
      document.body.style.overflow = ''
      if (url) URL.revokeObjectURL(url)
    }
  }, [item])

  const handleDownload = () => {
    const doc = buildPrescriptionDoc(item, slotDateFormat)
    const fileName = `Prescription_${item.docData?.name || 'Doctor'}_${item.slotDate}.pdf`
    doc.save(fileName.replace(/\s+/g, '_'))
  }

  return (
    <div className='fixed inset-0 z-50 flex flex-col' style={{ background: '#F3F4F6' }}>
      {/* Top bar – same style as CertificatePreviewModal */}
      <div className='flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shadow-sm flex-shrink-0'>
        <div className='flex items-center gap-3'>
          <div className='w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0'>
            <span className='text-white text-xs font-bold'>Rx</span>
          </div>
          <div>
            <p className='text-sm font-semibold text-gray-800'>Prescription Preview</p>
            <p className='text-xs text-gray-400'>
              {item.docData?.name} · {slotDateFormat ? slotDateFormat(item.slotDate) : item.slotDate} at {item.slotTime}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <button
            onClick={handleDownload}
            className='flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all shadow-sm'
          >
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' />
            </svg>
            Download PDF
          </button>
          <button onClick={onClose} className='w-9 h-9 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-400 text-xl transition-all'>×</button>
        </div>
      </div>

      {/* PDF viewer area */}
      <div className='flex-1 overflow-hidden flex items-center justify-center p-6 bg-gray-100'>
        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            title='Prescription Preview'
            className='w-full max-w-3xl h-full rounded-lg shadow-2xl border border-gray-200'
            style={{ minHeight: '500px' }}
          />
        ) : (
          <div className='text-center'>
            <div className='w-10 h-10 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-3'></div>
            <p className='text-sm text-gray-500'>Generating preview...</p>
          </div>
        )}
      </div>

      {/* Bottom hint */}
      <div className='px-6 py-2 bg-white border-t border-gray-100 text-center flex-shrink-0'>
        <p className='text-xs text-gray-400'>
          Use your browser's PDF controls to zoom or print. Click <strong className='text-gray-500'>Download PDF</strong> to save a copy.
        </p>
      </div>
    </div>
  )
}

// ─── Certificate Preview Modal (HTML-based, print-to-PDF) ─────────────────────
const CertificatePreviewModal = ({ item, onClose }) => {
  const cert = item.medicalCertificate
  const certNumber = getCertNumber(item._id)
  const verificationId = (item._id || '').slice(-8).toUpperCase()
  const issuedDate = cert?.issuedAt
    ? new Date(cert.issuedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : ''

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handlePrint = () => {
    const el = document.getElementById('medical-certificate-doc')
    if (!el) return
    const win = window.open('', '_blank', 'width=900,height=700')
    win.document.write(`<!DOCTYPE html><html><head>
      <title>Medical Certificate – ${certNumber}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
      <style>
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
        @page{size:A4 portrait;margin:0}
      </style>
    </head><body>${el.outerHTML}</body></html>`)
    win.document.close()
    win.focus()
    setTimeout(() => win.print(), 700)
  }

  return (
    <div className='fixed inset-0 z-50 flex flex-col' style={{ background: '#F3F4F6' }}>
      {/* Top bar */}
      <div className='flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shadow-sm flex-shrink-0'>
        <div className='flex items-center gap-3'>
          <div className='w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0'>
            <svg className='w-4 h-4 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' />
            </svg>
          </div>
          <div>
            <p className='text-sm font-semibold text-gray-800'>Medical Certificate</p>
            <p className='text-xs text-gray-400'>
              {item.docData?.name} · Issued {issuedDate}
              <span className='ml-2 font-mono text-gray-400'>{certNumber}</span>
            </p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <button
            onClick={handlePrint}
            className='flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all shadow-sm'
          >
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z' />
            </svg>
            Print / Save PDF
          </button>
          <button onClick={onClose} className='w-9 h-9 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-400 text-xl transition-all'>×</button>
        </div>
      </div>

      {/* Certificate render area */}
      <div className='flex-1 overflow-auto py-8 px-4'>
        <div className='mx-auto shadow-2xl' style={{ width: 'fit-content', borderRadius: '2px' }}>
          <CertificateDocument
            cert={cert}
            appointment={item}
            docProfile={item.docData}
            certNumber={certNumber}
            verificationId={verificationId}
          />
        </div>
      </div>

      {/* Bottom hint */}
      <div className='px-6 py-2 bg-white border-t border-gray-100 text-center flex-shrink-0'>
        <p className='text-xs text-gray-400'>
          Click <strong className='text-gray-500'>Print / Save PDF</strong> to export this certificate as a PDF via your browser's print dialog.
        </p>
      </div>
    </div>
  )
}

// ─── Coming Soon Modal ────────────────────────────────────────────────
const ComingSoonModal = ({ onClose }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-4'
      style={{ background: 'rgba(15,15,35,0.65)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className='relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden'
        onClick={e => e.stopPropagation()}
      >
        {/* Gradient top accent */}
        <div className='h-1.5 w-full' style={{ background: 'linear-gradient(90deg,#6366f1,#8b5cf6,#ec4899)' }} />

        {/* Close button */}
        <button
          onClick={onClose}
          className='absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all text-lg'
        >×</button>

        <div className='px-8 pt-8 pb-10 text-center'>
          {/* Animated icon */}
          <div className='relative mx-auto w-20 h-20 mb-6'>
            <div className='absolute inset-0 rounded-full bg-indigo-100 animate-ping opacity-40' />
            <div className='relative w-20 h-20 rounded-full flex items-center justify-center' style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
              <svg className='w-9 h-9 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' />
              </svg>
            </div>
          </div>

          {/* Badge */}
          <span className='inline-block px-3 py-1 rounded-full text-xs font-bold tracking-widest mb-4' style={{ background: 'linear-gradient(135deg,#ede9fe,#fce7f3)', color: '#7c3aed' }}>
            COMING SOON
          </span>

          <h2 className='text-2xl font-bold text-gray-900 mb-2'>Online Payments</h2>
          <p className='text-gray-500 text-sm leading-relaxed mb-1'>
            We're working hard to bring you a seamless payment experience.
          </p>
          <p className='text-gray-400 text-xs leading-relaxed mb-8'>
            Pay online for your appointments, prescriptions & more — all in one click. Stay tuned!
          </p>

          {/* Feature pills */}
          <div className='flex flex-wrap justify-center gap-2 mb-8'>
            {['💳 Cards', '📱 UPI', '🏦 Net Banking', '💰 Wallets'].map(f => (
              <span key={f} className='px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200'>{f}</span>
            ))}
          </div>

          <button
            onClick={onClose}
            className='w-full py-3 rounded-2xl text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-95'
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
          >
            Got it, I'll wait! 🚀
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────
const MyAppointments = () => {
  const { backendUrl, token, slotDateFormat } = useContext(AppContext)
  const [appointments, setAppointments] = useState([])
  const [previewItem, setPreviewItem] = useState(null)
  const [certPreviewItem, setCertPreviewItem] = useState(null)
  const [chatItem, setChatItem] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [emailItem, setEmailItem] = useState(null)
  const [showPayModal, setShowPayModal] = useState(false)
  // accordion state: [todayCompleted, todayCancelled, allCompleted, allCancelled]
  const [openTodayCompleted, setOpenTodayCompleted] = useState(false)
  const [openTodayCancelled, setOpenTodayCancelled] = useState(false)
  const [openAllCompleted, setOpenAllCompleted] = useState(false)
  const [openAllCancelled, setOpenAllCancelled] = useState(false)

  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/user/appointments', { headers: { token } })
      if (data.success) {
        setAppointments(data.appointments.reverse())
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(backendUrl + '/api/user/cancel-appointment', { appointmentId }, { headers: { token } })
      if (data.success) {
        toast.success(data.message)
        getUserAppointments()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const deleteAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(backendUrl + '/api/user/delete-appointment', { appointmentId }, { headers: { token } })
      if (data.success) {
        toast.success(data.message)
        setConfirmDeleteId(null)
        getUserAppointments()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const downloadPrescription = useCallback((item) => {
    const doc = buildPrescriptionDoc(item, slotDateFormat)
    const fileName = `Prescription_${item.docData?.name || 'Doctor'}_${item.slotDate}.pdf`
    doc.save(fileName.replace(/\s+/g, '_'))
  }, [slotDateFormat])

  const downloadCertificate = useCallback((item) => {
    // Opens certificate in a new window with print dialog for Save as PDF
    setCertPreviewItem(item)
  }, [])

  useEffect(() => {
    if (token) getUserAppointments()
  }, [token])

  const today = new Date()
  const todaySlotDate = `${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}`
  const todayAppointments = appointments.filter(a => a.slotDate === todaySlotDate)
  const allAppointments = appointments.filter(a => a.slotDate !== todaySlotDate)

  return (
    <div className='max-w-3xl mx-auto'>

      {/* Page header */}
      <div className='flex items-center justify-between mt-12 mb-6 pb-3 border-b border-gray-200'>
        <div>
          <h1 className='text-xl font-bold text-gray-800'>My Appointments</h1>
          <p className='text-sm text-gray-400 mt-0.5'>{appointments.length} appointment{appointments.length !== 1 ? 's' : ''} total</p>
        </div>
        <div className='hidden sm:flex items-center gap-4 text-xs text-gray-500'>
          <span className='flex items-center gap-1.5'><span className='w-2 h-2 rounded-full bg-indigo-500 animate-pulse inline-block'></span>Upcoming</span>
          <span className='flex items-center gap-1.5'><span className='w-2 h-2 rounded-full bg-green-500 inline-block'></span>Completed</span>
          <span className='flex items-center gap-1.5'><span className='w-2 h-2 rounded-full bg-red-400 inline-block'></span>Cancelled</span>
        </div>
      </div>

      {appointments.length === 0 && (
        <div className='text-center py-20'>
          <div className='text-6xl mb-4'>📭</div>
          <p className='text-gray-500 font-medium'>No appointments yet</p>
          <p className='text-sm text-gray-400 mt-1'>Book an appointment with a doctor to get started.</p>
        </div>
      )}

      {/* renderCard helper – defined inline via IIFE-style map */}
      {(() => {
        const renderCard = (item, index) => {
          const isPending  = !item.cancelled && !item.isCompleted
          const isCompleted = item.isCompleted
          const isCancelled = item.cancelled && !item.isCompleted

          const borderAccent = isPending ? 'border-l-indigo-500' : isCompleted ? 'border-l-green-500' : 'border-l-red-400'
          const cardBg       = isPending ? 'bg-white' : isCompleted ? 'bg-green-50/40' : 'bg-red-50/20'

          return (
            <div key={item._id || index}
              className={`rounded-2xl border border-gray-100 border-l-4 ${borderAccent} ${cardBg} shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden`}
            >
              {/* ── Card body ── */}
              <div className='flex gap-3 sm:gap-4 p-4 sm:p-5'>

                {/* Doctor photo */}
                <div className='flex-shrink-0'>
                  <img
                    src={item.docData.image}
                    alt={item.docData.name}
                    className={`w-20 h-20 sm:w-28 sm:h-28 rounded-xl object-cover border-2 transition-all ${
                      isPending  ? 'border-indigo-100' :
                      isCompleted ? 'border-green-100'  : 'border-gray-200 grayscale opacity-70'
                    }`}
                  />
                </div>

                {/* Info */}
                <div className='flex-1 min-w-0'>
                  {/* Top row: name + status badge */}
                  <div className='flex items-start justify-between gap-2 flex-wrap'>
                    <div>
                      <p className={`font-bold text-base leading-tight ${isPending ? 'text-gray-900' : 'text-gray-600'}`}>
                        {item.docData.name}
                      </p>
                      <p className={`text-sm font-medium mt-0.5 ${isPending ? 'text-indigo-600' : 'text-gray-400'}`}>
                        {item.docData.speciality}
                      </p>
                    </div>

                    {/* Status badge */}
                    {isPending && (
                      <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 border border-indigo-200 whitespace-nowrap'>
                        <span className='w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse inline-block'></span>
                        Upcoming
                      </span>
                    )}
                    {isCompleted && (
                      <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200 whitespace-nowrap'>
                        <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M5 13l4 4L19 7'/></svg>
                        Completed
                      </span>
                    )}
                    {isCancelled && (
                      <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600 border border-red-200 whitespace-nowrap'>
                        <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M6 18L18 6M6 6l12 12'/></svg>
                        Cancelled
                      </span>
                    )}
                  </div>

                  {/* Address */}
                  <div className='mt-2'>
                    <p className='text-xs font-semibold text-gray-400 uppercase tracking-wide'>Address</p>
                    <p className='text-xs text-gray-500 mt-0.5 leading-relaxed'>
                      {item.docData.address?.line1}
                      {item.docData.address?.line2 && <><br/>{item.docData.address.line2}</>}
                    </p>
                  </div>

                  {/* Date chip */}
                  <div className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                    isPending  ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                    isCompleted ? 'bg-green-50  text-green-700  border-green-100'  :
                                  'bg-gray-100  text-gray-500   border-gray-200'
                  }`}>
                    <svg className='w-3.5 h-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'/>
                    </svg>
                    {slotDateFormat(item.slotDate)} &nbsp;·&nbsp; {item.slotTime}
                  </div>

                  {/* Sub-badges */}
                  <div className='flex flex-wrap gap-2 mt-2'>
                    {item.prescription && (
                      <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100'>
                        <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'/></svg>
                        Prescription ready
                      </span>
                    )}
                    {item.medicalCertificate && (
                      <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-100'>
                        <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' />
                        </svg>
                        Medical Certificate
                        {item.medicalCertificate.fitForDuty != null && (
                          <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                            item.medicalCertificate.fitForDuty
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {item.medicalCertificate.fitForDuty ? 'Fit' : 'Unfit'}
                          </span>
                        )}
                      </span>
                    )}
                    {item.unreadCount > 0 && (
                      <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-500 text-white border border-blue-400'>
                        💬 {item.unreadCount} new
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Action bar ── */}
              <div className={`px-4 sm:px-5 pb-4 pt-3 flex flex-wrap gap-2 sm:gap-3 border-t ${
                isPending   ? 'border-indigo-50'  :
                isCompleted ? 'border-green-50/60' : 'border-gray-100'
              }`}>

                {/* UPCOMING */}
                {isPending && <>
                  <button
                    onClick={() => setShowPayModal(true)}
                    className='flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all'
                  >
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'/></svg>
                    Pay Online
                  </button>
                  <button
                    onClick={() => cancelAppointment(item._id)}
                    className='flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white transition-all'
                  >
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12'/></svg>
                    Cancel
                  </button>
                  <button
                    onClick={() => { setChatItem(item); if (item.unreadCount > 0) setAppointments(prev => prev.map(a => a._id === item._id ? {...a, unreadCount:0} : a)) }}
                    className='relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-600 hover:text-white transition-all'
                  >
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'/></svg>
                    Chat
                    {item.unreadCount > 0 && <span className='absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white'>{item.unreadCount}</span>}
                  </button>
                  <button
                    onClick={() => setEmailItem(item)}
                    className='flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-600 hover:text-white transition-all'
                  >
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' /></svg>
                    Email Doctor
                  </button>
                </>}

                {/* COMPLETED */}
                {isCompleted && <>
                  <button
                    onClick={() => { setChatItem(item); if (item.unreadCount > 0) setAppointments(prev => prev.map(a => a._id === item._id ? {...a, unreadCount:0} : a)) }}
                    className='relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-600 hover:text-white transition-all'
                  >
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'/></svg>
                    Chat
                    {item.unreadCount > 0 && <span className='absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white'>{item.unreadCount}</span>}
                  </button>
                  {item.prescription && (
                    <button onClick={() => setPreviewItem(item)} className='flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-600 hover:text-white transition-all'>
                      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'/><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'/></svg>
                      View Rx
                    </button>
                  )}
                  {item.medicalCertificate && (
                    <button
                      onClick={() => setCertPreviewItem(item)}
                      className='flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-600 hover:text-white transition-all'
                    >
                      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' />
                      </svg>
                      View Certificate
                    </button>
                  )}
                  <button
                    onClick={() => setEmailItem(item)}
                    className='flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-600 hover:text-white transition-all'
                  >
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' /></svg>
                    Email Doctor
                  </button>
                  {confirmDeleteId === item._id ? (
                    <div className='flex items-center gap-2 px-3 py-1.5 border border-red-200 rounded-lg bg-red-50'>
                      <span className='text-xs text-red-600 font-medium'>Delete record?</span>
                      <button onClick={() => deleteAppointment(item._id)} className='text-xs font-bold text-white bg-red-500 hover:bg-red-600 px-2.5 py-1 rounded transition-colors'>Yes</button>
                      <button onClick={() => setConfirmDeleteId(null)} className='text-xs font-bold text-gray-500 px-2 py-1'>No</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDeleteId(item._id)} className='flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-gray-400 border border-gray-200 hover:border-red-400 hover:text-red-500 hover:bg-red-50 transition-all'>
                      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'/></svg>
                      Erase Record
                    </button>
                  )}
                </>}

                {/* CANCELLED */}
                {isCancelled && <>
                  {confirmDeleteId === item._id ? (
                    <div className='flex items-center gap-2 px-3 py-1.5 border border-red-200 rounded-lg bg-red-50'>
                      <span className='text-xs text-red-600 font-medium'>Delete record?</span>
                      <button onClick={() => deleteAppointment(item._id)} className='text-xs font-bold text-white bg-red-500 hover:bg-red-600 px-2.5 py-1 rounded transition-colors'>Yes</button>
                      <button onClick={() => setConfirmDeleteId(null)} className='text-xs font-bold text-gray-500 px-2 py-1'>No</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDeleteId(item._id)} className='flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-gray-400 border border-gray-200 hover:border-red-400 hover:text-red-500 hover:bg-red-50 transition-all'>
                      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'/></svg>
                      Erase Record
                    </button>
                  )}
                </>}

              </div>
            </div>
          )
        }

        const renderSection = (list, openCompleted, setOpenCompleted, openCancelled, setOpenCancelled) => {
          const pending   = list.filter(a => !a.cancelled && !a.isCompleted)
          const completed = list.filter(a => a.isCompleted)
          const cancelled = list.filter(a => a.cancelled && !a.isCompleted)

          return (
            <div className='space-y-6'>
              {/* Pending – always visible */}
              {pending.length > 0 ? (
                <div className='flex flex-col gap-5'>
                  {pending.map((item, i) => renderCard(item, i))}
                </div>
              ) : (
                <div className='flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-50/50 border border-indigo-100 text-sm text-indigo-500'>
                  <span className='text-lg'>✅</span> No pending appointments in this section.
                </div>
              )}

              {/* Completed – collapsible */}
              {completed.length > 0 && (
                <div>
                  <button
                    onClick={() => setOpenCompleted(o => !o)}
                    className='w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-green-50 border border-green-100 hover:bg-green-100 transition-colors group'
                  >
                    <span className='flex items-center gap-2 text-sm font-semibold text-green-700'>
                      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7'/></svg>
                      Completed
                      <span className='bg-green-200 text-green-800 text-xs font-bold px-2 py-0.5 rounded-full'>{completed.length}</span>
                    </span>
                    <svg className={`w-4 h-4 text-green-500 transition-transform duration-200 ${openCompleted ? 'rotate-180' : ''}`} fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7'/></svg>
                  </button>
                  {openCompleted && (
                    <div className='flex flex-col gap-5 mt-4'>
                      {completed.map((item, i) => renderCard(item, i))}
                    </div>
                  )}
                </div>
              )}

              {/* Cancelled – collapsible */}
              {cancelled.length > 0 && (
                <div>
                  <button
                    onClick={() => setOpenCancelled(o => !o)}
                    className='w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-red-50 border border-red-100 hover:bg-red-100 transition-colors group'
                  >
                    <span className='flex items-center gap-2 text-sm font-semibold text-red-600'>
                      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12'/></svg>
                      Cancelled
                      <span className='bg-red-200 text-red-800 text-xs font-bold px-2 py-0.5 rounded-full'>{cancelled.length}</span>
                    </span>
                    <svg className={`w-4 h-4 text-red-400 transition-transform duration-200 ${openCancelled ? 'rotate-180' : ''}`} fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7'/></svg>
                  </button>
                  {openCancelled && (
                    <div className='flex flex-col gap-5 mt-4'>
                      {cancelled.map((item, i) => renderCard(item, i))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        }

        return (
          <>
            {/* ── TODAY'S APPOINTMENTS ── */}
            <div className='mb-10'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-200'>
                  <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                  </svg>
                  <span className='text-sm font-bold'>Today's Appointments</span>
                  <span className='ml-1 bg-white/25 text-white text-xs font-bold px-2 py-0.5 rounded-full'>{todayAppointments.length}</span>
                </div>
                <span className='text-xs text-gray-400'>{today.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
              </div>

              {todayAppointments.length === 0 ? (
                <div className='flex items-center gap-4 p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100'>
                  <div className='text-3xl'>☀️</div>
                  <div>
                    <p className='font-semibold text-indigo-700 text-sm'>No appointments today</p>
                    <p className='text-xs text-indigo-400 mt-0.5'>You're free today! Check your upcoming schedule below.</p>
                  </div>
                </div>
              ) : renderSection(todayAppointments, openTodayCompleted, setOpenTodayCompleted, openTodayCancelled, setOpenTodayCancelled)}
            </div>

            {/* ── ALL APPOINTMENTS ── */}
            <div className='pb-8'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-gray-200 text-gray-700 shadow-sm'>
                  <svg className='w-4 h-4 text-gray-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
                  </svg>
                  <span className='text-sm font-bold'>All Appointments</span>
                  <span className='ml-1 bg-gray-100 text-gray-500 text-xs font-bold px-2 py-0.5 rounded-full'>{allAppointments.length}</span>
                </div>
              </div>

              {allAppointments.length === 0 ? (
                <div className='flex items-center gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-100'>
                  <div className='text-3xl'>📋</div>
                  <div>
                    <p className='font-semibold text-gray-600 text-sm'>No other appointments</p>
                    <p className='text-xs text-gray-400 mt-0.5'>All your appointments are scheduled for today.</p>
                  </div>
                </div>
              ) : renderSection(allAppointments, openAllCompleted, setOpenAllCompleted, openAllCancelled, setOpenAllCancelled)}
            </div>
          </>
        )
      })()}

      {/* Prescription Preview Modal */}
      {previewItem && (
        <PrescriptionPreviewModal
          item={previewItem}
          onClose={() => setPreviewItem(null)}
          slotDateFormat={slotDateFormat}
        />
      )}

      {/* Certificate Preview Modal */}
      {certPreviewItem && (
        <CertificatePreviewModal
          item={certPreviewItem}
          onClose={() => setCertPreviewItem(null)}
        />
      )}

      {/* Chat Modal */}
      {chatItem && (
        <ChatModal
          appointment={chatItem}
          onClose={() => setChatItem(null)}
        />
      )}

      {/* Email Modal */}
      {emailItem && (
        <EmailModal
          appointment={emailItem}
          onClose={() => setEmailItem(null)}
        />
      )}

      {/* Pay Online – Coming Soon Modal */}
      {showPayModal && (
        <ComingSoonModal onClose={() => setShowPayModal(false)} />
      )}
    </div>
  )
}

export default MyAppointments
