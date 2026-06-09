import React, { useState, useEffect, useContext } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { jsPDF } from 'jspdf'

const PrescriptionModal = ({ appointment, onClose }) => {
    const { savePrescription, docProfile } = useContext(DoctorContext)

    const existingRx = appointment?.prescription || null
    const [medicines, setMedicines] = useState(
        existingRx?.medicines || [{ name: '', dosage: '', frequency: '', duration: '' }]
    )
    const [instructions, setInstructions] = useState(existingRx?.instructions || '')
    const [followUpDate, setFollowUpDate] = useState(existingRx?.followUpDate || '')
    const [notes, setNotes] = useState(existingRx?.notes || '')
    const [diagnosedDisease, setDiagnosedDisease] = useState(existingRx?.diagnosedDisease || '')
    const [patientWeight, setPatientWeight] = useState(existingRx?.patientWeight || '')
    const [saving, setSaving] = useState(false)

    // Prevent body scroll when modal open
    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = '' }
    }, [])

    const addMedicine = () => {
        setMedicines(prev => [...prev, { name: '', dosage: '', frequency: '', duration: '' }])
    }

    const removeMedicine = (index) => {
        setMedicines(prev => prev.filter((_, i) => i !== index))
    }

    const updateMedicine = (index, field, value) => {
        setMedicines(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m))
    }

    const getPrescription = () => ({
        medicines: medicines.filter(m => m.name.trim()),
        diagnosedDisease,
        patientWeight,
        instructions,
        followUpDate,
        notes
    })

    const handleSave = async () => {
        if (!medicines.some(m => m.name.trim())) {
            return alert('Please add at least one medicine.')
        }
        setSaving(true)
        const ok = await savePrescription(appointment._id, getPrescription())
        setSaving(false)
        if (ok) onClose()
    }

    const handleDownloadPDF = () => {
        const rx = getPrescription()
        const doc = new jsPDF({ unit: 'mm', format: 'a4' })
        const W = doc.internal.pageSize.getWidth()
        let y = 0

        // ── Header band ──────────────────────────────────────────────────────
        doc.setFillColor(79, 70, 229)
        doc.rect(0, 0, W, 38, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(24)
        doc.setFont('helvetica', 'bold')
        doc.text('Medico', 15, 18)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.text('Digital Healthcare Platform', 15, 26)

        if (docProfile) {
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(12)
            doc.text(docProfile.name, W - 15, 16, { align: 'right' })
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(9)
            doc.text(`${docProfile.speciality} | ${docProfile.degree}`, W - 15, 23, { align: 'right' })
            doc.text(`Exp: ${docProfile.experience}`, W - 15, 29, { align: 'right' })
        }

        y = 50

        // ── Patient Info box ─────────────────────────────────────────────────
        const hasWeight = !!rx.patientWeight
        const patBoxH = hasWeight ? 34 : 28
        doc.setFillColor(245, 247, 255)
        doc.roundedRect(12, y, W - 24, patBoxH, 3, 3, 'F')
        doc.setTextColor(60, 60, 80)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10)
        doc.text('PATIENT INFORMATION', 18, y + 8)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        const pat = appointment.userData
        doc.text(`Name: ${pat?.name || 'N/A'}`, 18, y + 16)
        doc.text(`Date: ${appointment.slotDate} | Time: ${appointment.slotTime}`, 18, y + 23)
        doc.text(`Phone: ${pat?.phone || 'N/A'}`, W / 2 + 10, y + 16)
        doc.text(`Gender: ${pat?.gender || 'N/A'}`, W / 2 + 10, y + 23)
        if (hasWeight) {
            doc.text(`Weight: ${rx.patientWeight} kg`, 18, y + 30)
        }

        y += patBoxH + 8

        // ── Prescription Title ────────────────────────────────────────────────
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(12)
        doc.setTextColor(79, 70, 229)
        doc.text('PRESCRIPTION', 15, y)
        doc.setDrawColor(79, 70, 229)
        doc.setLineWidth(0.5)
        doc.line(15, y + 2, W - 15, y + 2)
        y += 10

        // ── Diagnosed Disease ─────────────────────────────────────────────────
        if (rx.diagnosedDisease) {
            doc.setFillColor(255, 243, 230)
            doc.roundedRect(12, y, W - 24, 10, 2, 2, 'F')
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(9)
            doc.setTextColor(180, 80, 20)
            doc.text('Diagnosis:', 16, y + 6.5)
            doc.setFont('helvetica', 'normal')
            doc.setTextColor(100, 40, 10)
            doc.text(rx.diagnosedDisease, 38, y + 6.5)
            y += 14
        }

        // ── Medicines Table ───────────────────────────────────────────────────
        if (rx.medicines.length > 0) {
            // Table header
            doc.setFillColor(79, 70, 229)
            doc.setTextColor(255, 255, 255)
            doc.rect(12, y, W - 24, 8, 'F')
            doc.setFontSize(8.5)
            doc.setFont('helvetica', 'bold')
            const cols = [14, 70, 110, 145, 175]
            const headers = ['Medicine Name', 'Dosage', 'Frequency', 'Duration']
            headers.forEach((h, i) => doc.text(h, cols[i], y + 5.5))
            y += 8

            // Table rows
            rx.medicines.forEach((med, idx) => {
                const bg = idx % 2 === 0 ? [255, 255, 255] : [248, 249, 255]
                doc.setFillColor(...bg)
                doc.rect(12, y, W - 24, 8, 'F')
                doc.setTextColor(50, 50, 70)
                doc.setFont('helvetica', 'normal')
                doc.setFontSize(8.5)
                doc.text(med.name || '', cols[0], y + 5.5)
                doc.text(med.dosage || '', cols[1], y + 5.5)
                doc.text(med.frequency || '', cols[2], y + 5.5)
                doc.text(med.duration || '', cols[3], y + 5.5)
                y += 8
            })

            // Table border
            doc.setDrawColor(200, 200, 220)
            doc.setLineWidth(0.3)
            doc.rect(12, y - 8 * (rx.medicines.length + 1), W - 24, 8 * (rx.medicines.length + 1))
            y += 8
        }

        // ── Instructions ──────────────────────────────────────────────────────
        if (rx.instructions) {
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(10)
            doc.setTextColor(79, 70, 229)
            doc.text('Instructions', 15, y)
            y += 6
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(9)
            doc.setTextColor(60, 60, 80)
            const lines = doc.splitTextToSize(rx.instructions, W - 30)
            doc.text(lines, 15, y)
            y += lines.length * 5 + 4
        }

        // ── Follow-up ─────────────────────────────────────────────────────────
        if (rx.followUpDate) {
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(10)
            doc.setTextColor(79, 70, 229)
            doc.text('Follow-up Date:', 15, y)
            doc.setFont('helvetica', 'normal')
            doc.setTextColor(60, 60, 80)
            doc.text(rx.followUpDate, 55, y)
            y += 10
        }

        // ── Notes ─────────────────────────────────────────────────────────────
        if (rx.notes) {
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(10)
            doc.setTextColor(79, 70, 229)
            doc.text('Notes', 15, y)
            y += 6
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(9)
            doc.setTextColor(60, 60, 80)
            const noteLines = doc.splitTextToSize(rx.notes, W - 30)
            doc.text(noteLines, 15, y)
            y += noteLines.length * 5 + 4
        }

        // ── Signature area ─────────────────────────────────────────────────
        const sigY = Math.max(y + 20, 240)
        doc.setDrawColor(180, 180, 200)
        doc.setLineWidth(0.4)
        doc.line(W - 75, sigY, W - 15, sigY)
        // Doctor name above line
        if (docProfile?.name) {
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(9)
            doc.setTextColor(60, 60, 80)
            doc.text(docProfile.name, W - 45, sigY - 4, { align: 'center' })
        }
        // Label below line
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7.5)
        doc.setTextColor(120, 120, 140)
        doc.text("Doctor's Signature", W - 45, sigY + 4.5, { align: 'center' })

        // ── Footer ────────────────────────────────────────────────────────────
        doc.setFillColor(245, 247, 255)
        doc.rect(0, 285, W, 12, 'F')
        doc.setFontSize(7.5)
        doc.setTextColor(130, 130, 150)
        doc.text('This prescription is computer-generated by Medico Digital Healthcare Platform.', W / 2, 291, { align: 'center' })
        doc.text('Please consult your doctor for any queries.', W / 2, 295.5, { align: 'center' })

        const fileName = `Prescription_${appointment.userData?.name || 'Patient'}_${appointment.slotDate}.pdf`
        doc.save(fileName.replace(/\s+/g, '_'))
    }

    const inputClass = 'border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all'

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4'>
            <div className='bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col'>

                {/* Header */}
                <div className='flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-primary/5 to-blue-50 rounded-t-2xl'>
                    <div>
                        <h2 className='text-xl font-bold text-gray-800'>Write Prescription</h2>
                        <p className='text-sm text-gray-500 mt-0.5'>
                            Patient: <span className='font-semibold text-gray-700'>{appointment?.userData?.name}</span>
                            &nbsp;•&nbsp; {appointment?.slotDate} at {appointment?.slotTime}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-all text-xl font-light'
                    >×</button>
                </div>

                {/* Body */}
                <div className='overflow-y-auto flex-1 px-6 py-5 space-y-6'>

                    {/* Medicines */}
                    <div>
                        <div className='flex items-center justify-between mb-3'>
                            <h3 className='font-semibold text-gray-700 flex items-center gap-2'>
                                <span className='w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold'>Rx</span>
                                Medicines
                            </h3>
                            <button
                                onClick={addMedicine}
                                className='text-xs text-primary border border-primary px-3 py-1.5 rounded-lg hover:bg-primary hover:text-white transition-all font-medium'
                            >+ Add Medicine</button>
                        </div>

                        <div className='space-y-2'>
                            {/* Column headers */}
                            <div className='grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-2 text-xs text-gray-400 font-medium px-1'>
                                <span>Medicine Name *</span>
                                <span>Dosage</span>
                                <span>Frequency</span>
                                <span>Duration</span>
                                <span className='w-6'></span>
                            </div>
                            {medicines.map((med, idx) => (
                                <div key={idx} className='grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-2 items-center bg-gray-50 rounded-lg p-2'>
                                    <input
                                        className={inputClass + ' bg-white'}
                                        placeholder='e.g. Paracetamol 500mg'
                                        value={med.name}
                                        onChange={e => updateMedicine(idx, 'name', e.target.value)}
                                    />
                                    <input
                                        className={inputClass + ' bg-white'}
                                        placeholder='e.g. 1 tablet'
                                        value={med.dosage}
                                        onChange={e => updateMedicine(idx, 'dosage', e.target.value)}
                                    />
                                    <select
                                        className={inputClass + ' bg-white'}
                                        value={med.frequency}
                                        onChange={e => updateMedicine(idx, 'frequency', e.target.value)}
                                    >
                                        <option value=''>Select</option>
                                        <option value='Once daily'>Once daily</option>
                                        <option value='Twice daily'>Twice daily</option>
                                        <option value='Thrice daily'>Thrice daily</option>
                                        <option value='Every 4 hours'>Every 4 hours</option>
                                        <option value='Every 6 hours'>Every 6 hours</option>
                                        <option value='Every 8 hours'>Every 8 hours</option>
                                        <option value='As needed'>As needed</option>
                                        <option value='Before meals'>Before meals</option>
                                        <option value='After meals'>After meals</option>
                                    </select>
                                    <input
                                        className={inputClass + ' bg-white'}
                                        placeholder='e.g. 5 days'
                                        value={med.duration}
                                        onChange={e => updateMedicine(idx, 'duration', e.target.value)}
                                    />
                                    <button
                                        onClick={() => removeMedicine(idx)}
                                        disabled={medicines.length === 1}
                                        className='w-7 h-7 flex items-center justify-center rounded-full text-red-400 hover:bg-red-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-lg'
                                    >×</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Instructions */}
                    <div>
                        <label className='block text-sm font-semibold text-gray-700 mb-2'>Instructions</label>
                        <textarea
                            className={inputClass + ' w-full resize-none'}
                            rows={3}
                            placeholder='e.g. Take medicine with warm water. Avoid cold drinks. Rest well.'
                            value={instructions}
                            onChange={e => setInstructions(e.target.value)}
                        />
                    </div>

                    {/* Diagnosis & Weight row */}
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        {/* Diagnosed Disease */}
                        <div>
                            <label className='block text-sm font-semibold text-gray-700 mb-2'>
                                Diagnosed Disease
                                <span className='ml-1 text-xs text-gray-400 font-normal'>(optional)</span>
                            </label>
                            <input
                                className={inputClass + ' w-full'}
                                placeholder='e.g. Viral Fever, Type 2 Diabetes'
                                value={diagnosedDisease}
                                onChange={e => setDiagnosedDisease(e.target.value)}
                            />
                        </div>

                        {/* Patient Weight */}
                        <div>
                            <label className='block text-sm font-semibold text-gray-700 mb-2'>
                                Patient Weight
                                <span className='ml-1 text-xs text-gray-400 font-normal'>(kg, optional)</span>
                            </label>
                            <div className='relative'>
                                <input
                                    type='number'
                                    min='1'
                                    max='500'
                                    className={inputClass + ' w-full pr-10'}
                                    placeholder='e.g. 68'
                                    value={patientWeight}
                                    onChange={e => setPatientWeight(e.target.value)}
                                />
                                <span className='absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none'>kg</span>
                            </div>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        {/* Follow-up Date */}
                        <div>
                            <label className='block text-sm font-semibold text-gray-700 mb-2'>Follow-up Date</label>
                            <input
                                type='date'
                                className={inputClass + ' w-full'}
                                value={followUpDate}
                                onChange={e => setFollowUpDate(e.target.value)}
                            />
                        </div>

                        {/* Notes */}
                        <div>
                            <label className='block text-sm font-semibold text-gray-700 mb-2'>Additional Notes</label>
                            <input
                                className={inputClass + ' w-full'}
                                placeholder='e.g. Refer to lab for CBC'
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className='px-6 py-4 border-t bg-gray-50 rounded-b-2xl flex flex-col sm:flex-row items-center gap-3'>
                    <button
                        onClick={handleDownloadPDF}
                        className='flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-primary text-primary font-semibold text-sm hover:bg-primary/5 transition-all w-full sm:w-auto justify-center'
                    >
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' />
                        </svg>
                        Download PDF
                    </button>
                    <div className='flex gap-3 w-full sm:w-auto sm:ml-auto'>
                        <button
                            onClick={onClose}
                            className='flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-100 transition-all'
                        >Cancel</button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className='flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-70 flex items-center justify-center gap-2'
                        >
                            {saving ? (
                                <><svg className='animate-spin w-4 h-4' fill='none' viewBox='0 0 24 24'><circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle><path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'></path></svg>Saving...</>
                            ) : 'Save Prescription'}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default PrescriptionModal
