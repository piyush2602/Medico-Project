import React, { useContext, useEffect, useState, useCallback } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { jsPDF } from 'jspdf'
import ChatModal from '../components/ChatModal'

// ─── Shared PDF builder ────────────────────────────────────────────────────────
const buildPrescriptionDoc = (item) => {
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
  doc.text(`Date: ${item.slotDate} | Time: ${item.slotTime}`, 18, y + 23)
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
const PrescriptionPreviewModal = ({ item, onClose }) => {
  const [pdfUrl, setPdfUrl] = useState(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    // Build PDF and get blob URL for the iframe
    const doc = buildPrescriptionDoc(item)
    const url = doc.output('bloburl')
    setPdfUrl(url)
    return () => {
      document.body.style.overflow = ''
      // Revoke object URL to free memory
      if (url) URL.revokeObjectURL(url)
    }
  }, [item])

  const handleDownload = () => {
    const doc = buildPrescriptionDoc(item)
    const fileName = `Prescription_${item.docData?.name || 'Doctor'}_${item.slotDate}.pdf`
    doc.save(fileName.replace(/\s+/g, '_'))
  }

  return (
    <div className='fixed inset-0 z-50 flex flex-col bg-black/70 backdrop-blur-sm'>

      {/* Top bar */}
      <div className='flex items-center justify-between px-5 py-3 bg-gray-900 text-white flex-shrink-0'>
        <div className='flex items-center gap-3'>
          <span className='w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-xs font-bold'>Rx</span>
          <div>
            <p className='font-semibold text-sm'>Prescription Preview</p>
            <p className='text-xs text-gray-400'>
              {item.docData?.name} • {item.slotDate} at {item.slotTime}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <button
            onClick={handleDownload}
            className='flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all'
          >
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' />
            </svg>
            Download PDF
          </button>
          <button
            onClick={onClose}
            className='w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xl transition-all'
          >×</button>
        </div>
      </div>

      {/* PDF iframe area */}
      <div className='flex-1 overflow-hidden bg-gray-700 flex items-center justify-center p-4'>
        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            title='Prescription Preview'
            className='w-full max-w-3xl h-full rounded-lg shadow-2xl border-0'
            style={{ minHeight: '500px' }}
          />
        ) : (
          <div className='text-center text-white'>
            <div className='w-10 h-10 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-3'></div>
            <p className='text-sm text-gray-300'>Generating preview...</p>
          </div>
        )}
      </div>

      {/* Bottom hint */}
      <div className='px-5 py-2 bg-gray-900 text-center flex-shrink-0'>
        <p className='text-xs text-gray-500'>
          Use your browser's PDF controls to zoom or print. Click <strong className='text-gray-400'>Download PDF</strong> to save a copy.
        </p>
      </div>

    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────
const MyAppointments = () => {
  const { backendUrl, token } = useContext(AppContext)
  const [appointments, setAppointments] = useState([])
  const [previewItem, setPreviewItem] = useState(null)
  const [chatItem, setChatItem] = useState(null)

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

  const downloadPrescription = useCallback((item) => {
    const doc = buildPrescriptionDoc(item)
    const fileName = `Prescription_${item.docData?.name || 'Doctor'}_${item.slotDate}.pdf`
    doc.save(fileName.replace(/\s+/g, '_'))
  }, [])

  useEffect(() => {
    if (token) getUserAppointments()
  }, [token])

  return (
    <div>
      <p className='pb-3 mt-12 font-medium text-zinc-700 border-b'>My appointments</p>
      <div>
        {appointments.map((item, index) => (
          <div className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b' key={index}>
            <div>
              <img className='w-32 bg-indigo-50' src={item.docData.image} alt='' />
            </div>
            <div className='flex-1 text-sm text-zinc-600'>
              <p className='text-neutral-800 font-semibold'>{item.docData.name}</p>
              <p>{item.docData.speciality}</p>
              <p className='text-zinc-700 font-medium mt-1'>Address:</p>
              <p className='text-xs'>{item.docData.address.line1}</p>
              <p className='text-xs'>{item.docData.address.line2}</p>
              <p className='text-xs mt-1'>
                <span className='text-sm text-neutral-700 font-medium'>Date &amp; Time:</span>{' '}
                {item.slotDate} | {item.slotTime}
              </p>
              {/* Prescription indicator */}
              {item.prescription && (
                <p className='text-xs mt-1 text-indigo-600 font-medium flex items-center gap-1'>
                  <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                      d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                  </svg>
                  Prescription available
                </p>
              )}
            </div>
            <div></div>
            <div className='flex flex-col gap-2 justify-end'>
              {!item.cancelled && !item.isCompleted && (
                <button className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-green-600 hover:text-white transition-all duration-300'>
                  Pay Online
                </button>
              )}
              {!item.cancelled && !item.isCompleted && (
                <button
                  onClick={() => cancelAppointment(item._id)}
                  className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300'
                >Cancel appointment</button>
              )}
              {item.cancelled && !item.isCompleted && (
                <button className='sm:min-w-48 py-2 border border-red-500 rounded text-red-500'>Appointment cancelled</button>
              )}
              {item.isCompleted && (
                <button className='sm:min-w-48 py-2 border border-green-500 rounded text-green-500'>Completed</button>
              )}

              {/* Prescription action buttons */}
              {item.prescription && (
                <>
                  {/* Preview */}
                  <button
                    onClick={() => setPreviewItem(item)}
                    className='text-sm font-medium text-center sm:min-w-48 py-2 border border-indigo-400 rounded text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all duration-300 flex items-center justify-center gap-1.5'
                  >
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                        d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                        d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                    </svg>
                    Preview Prescription
                  </button>

                  {/* Download */}
                  <button
                    onClick={() => downloadPrescription(item)}
                    className='text-sm font-medium text-center sm:min-w-48 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-800 hover:text-white hover:border-gray-800 transition-all duration-300 flex items-center justify-center gap-1.5'
                  >
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                        d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' />
                    </svg>
                    Download Prescription
                  </button>
                </>
              )}

              {/* Chat Button */}
              {!item.cancelled && (
                <button
                  onClick={() => setChatItem(item)}
                  className='text-sm font-medium text-center sm:min-w-48 py-2 border border-blue-400 rounded text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 flex items-center justify-center gap-1.5'
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Chat with Doctor
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Full-screen PDF Preview Modal */}
      {previewItem && (
        <PrescriptionPreviewModal
          item={previewItem}
          onClose={() => setPreviewItem(null)}
        />
      )}

      {/* Chat Modal */}
      {chatItem && (
        <ChatModal
          appointment={chatItem}
          onClose={() => setChatItem(null)}
        />
      )}
    </div>
  )
}

export default MyAppointments
