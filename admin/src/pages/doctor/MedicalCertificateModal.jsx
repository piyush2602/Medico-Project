import React, { useState, useEffect, useContext } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getCertNumber = (appointmentId) => {
  const year = new Date().getFullYear()
  const suffix = (appointmentId || 'XXXXXX').slice(-6).toUpperCase()
  return `MC-${year}-${suffix}`
}

const fmt = (dateStr) => {
  if (!dateStr) return 'N/A'
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric',
    })
  } catch { return dateStr }
}

// ─── Certificate Document (Printable HTML, A4, inline-styled) ─────────────────
export const MedicalCertificateDocument = ({
  cert, appointment, docProfile, certNumber, verificationId,
}) => {
  if (!cert) return null

  const issuedDate = cert.issuedAt ? fmt(cert.issuedAt) : fmt(new Date().toISOString())
  const patientName = cert.patientName || appointment?.userData?.name || 'N/A'
  const gender = cert.gender || appointment?.userData?.gender || ''
  const salutation = gender === 'Female' ? 'Ms.' : gender === 'Male' ? 'Mr.' : ''

  const examDate = cert.examinationDate ? fmt(cert.examinationDate) : issuedDate

  const bodyText = cert.fitForDuty ? (
    <>
      This is to certify that <strong>{salutation ? salutation + ' ' : ''}{patientName}</strong>, aged <strong>{cert.age || '—'} years</strong>, was examined by the undersigned on <strong>{examDate}</strong>. Based on thorough clinical assessment, the patient is found to be medically fit to attend {cert.issuedFor || 'work/school/college'}{cert.fromDate ? <> with effect from <strong>{fmt(cert.fromDate)}</strong></> : ''}.
    </>
  ) : (
    <>
      This is to certify that <strong>{salutation ? salutation + ' ' : ''}{patientName}</strong>, aged <strong>{cert.age || '—'} years</strong>, was examined by the undersigned on <strong>{examDate}</strong> and was found to be suffering from <strong>{cert.diagnosis || '—'}</strong>. Based on clinical assessment, the patient has been advised complete rest and is medically unfit to attend {cert.issuedFor || 'work/school/college'}{cert.fromDate ? <> from <strong>{fmt(cert.fromDate)}</strong></> : ''}{cert.toDate ? <> to <strong>{fmt(cert.toDate)}</strong></> : ''}. The patient is expected to resume normal activities{cert.toDate ? <> after <strong>{fmt(cert.toDate)}</strong></> : ''}, subject to satisfactory recovery.
    </>
  )

  const qrData = encodeURIComponent(`${certNumber}|VID:${verificationId}`)
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${qrData}&bgcolor=ffffff&color=1e40af&margin=4`

  const infoRows = [
    ['Patient Name',          patientName],
    ['Age',                   cert.age ? `${cert.age} years` : 'N/A'],
    ['Gender',                cert.gender || 'N/A'],
    ['Patient ID',            (appointment?._id || '').slice(-8).toUpperCase() || 'N/A'],
    ['Diagnosis / Condition', cert.diagnosis || (cert.fitForDuty ? 'Medically Fit' : 'N/A')],
    ['Examination Date',      examDate],
    ['Leave From',            cert.fromDate ? fmt(cert.fromDate) : 'N/A'],
    ['Leave To',              cert.toDate   ? fmt(cert.toDate)   : 'N/A'],
    ['Total Leave Days',      cert.leaveDays ? `${cert.leaveDays} day(s)` : 'N/A'],
    ['Fitness Status',        cert.fitForDuty ? 'Fit for Duty / Work' : 'Unfit – Rest Advised'],
    ['Issued For',            cert.issuedFor || 'Office / School / College'],
    ['Remarks',               cert.remarks || '—'],
  ]

  return (
    <div
      id='medical-certificate-doc'
      style={{
        position: 'relative', background: '#fff',
        width: '210mm', minHeight: '297mm',
        padding: '16mm 18mm 14mm',
        fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
        fontSize: '14px', color: '#1F2937',
        boxSizing: 'border-box', margin: '0 auto',
      }}
    >
      {/* Borders */}
      <div style={{ position:'absolute', top:'7mm', left:'7mm', right:'7mm', bottom:'7mm', border:'1px solid #E5E7EB', pointerEvents:'none', zIndex:0 }} />
      <div style={{ position:'absolute', top:'9.5mm', left:'9.5mm', right:'9.5mm', bottom:'9.5mm', border:'0.5px solid #BFDBFE', pointerEvents:'none', zIndex:0 }} />

      {/* Watermark */}
      <div style={{
        position:'absolute', top:'50%', left:'50%',
        transform:'translate(-50%,-50%) rotate(-45deg)',
        fontSize:'96px', fontWeight:900, letterSpacing:'10px',
        color:'rgba(37,99,235,0.034)', whiteSpace:'nowrap',
        pointerEvents:'none', userSelect:'none', zIndex:0,
      }}>MEDICO</div>

      <div style={{ position:'relative', zIndex:1 }}>

        {/* ── HEADER ── */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'14px' }}>
          <div style={{ display:'flex', gap:'14px', alignItems:'flex-start' }}>
            <img src={assets.admin_logo} alt='Medico Logo' style={{ height: '48px', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize:'24px', fontWeight:700, color:'#1F2937', lineHeight:1.15 }}>Medico Healthcare</div>
              <div style={{ fontSize:'11px', color:'#6B7280', marginTop:'3px' }}>Advanced Medical Centre &amp; Diagnostic Hub</div>
              <div style={{ fontSize:'11px', color:'#6B7280', marginTop:'7px', lineHeight:1.75 }}>
                123 Health Avenue, Medical District, Mumbai – 400001<br />
                +91 98765 43210 &nbsp;|&nbsp; care@medico.health &nbsp;|&nbsp; www.medico.health
              </div>
            </div>
          </div>
          <div style={{ textAlign:'right', paddingTop:'2px' }}>
            <div style={{ fontSize:'15px', fontWeight:600, color:'#1F2937' }}>{docProfile?.name || 'Doctor Name'}</div>
            <div style={{ fontSize:'11px', color:'#6B7280', marginTop:'3px' }}>{docProfile?.degree || 'MBBS, MD'}</div>
            <div style={{ fontSize:'11px', color:'#6B7280' }}>{docProfile?.speciality || 'Specialist'}</div>
            <div style={{ fontSize:'10.5px', color:'#9CA3AF', marginTop:'5px' }}>Reg. No: {docProfile?.registrationNumber || 'MCI/2024/001'}</div>
          </div>
        </div>

        {/* Dividers */}
        <div style={{ borderTop:'2px solid #2563EB', marginBottom:'3px' }} />
        <div style={{ borderTop:'0.5px solid #DBEAFE', marginBottom:'16px' }} />

        {/* Cert number row */}
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'16px' }}>
          <span style={{ fontSize:'11px', color:'#6B7280' }}>
            Certificate No:&nbsp;
            <strong style={{ color:'#374151', fontFamily:'monospace', letterSpacing:'0.5px' }}>{certNumber}</strong>
          </span>
          <span style={{ fontSize:'11px', color:'#6B7280' }}>
            Verification ID:&nbsp;
            <strong style={{ color:'#374151', fontFamily:'monospace' }}>{verificationId}</strong>
          </span>
        </div>

        {/* ── TITLE ── */}
        <div style={{ textAlign:'center', marginBottom:'20px' }}>
          <div style={{ fontSize:'20px', fontWeight:700, letterSpacing:'4px', color:'#1F2937' }}>MEDICAL CERTIFICATE</div>
          <div style={{ fontSize:'12px', color:'#6B7280', fontStyle:'italic', marginTop:'5px' }}>(To Whom It May Concern)</div>
          <div style={{ width:'48px', height:'2.5px', background:'#2563EB', margin:'9px auto 0', borderRadius:'2px' }} />
        </div>

        {/* ── BODY ── */}
        <div style={{ fontSize:'14px', lineHeight:1.85, color:'#374151', textAlign:'justify', marginBottom:'20px', padding:'0 2mm' }}>
          {bodyText}
        </div>

        {/* ── PATIENT INFO TABLE ── */}
        <div style={{ border:'1px solid #E5E7EB', borderRadius:'6px', overflow:'hidden', marginBottom:'16px' }}>
          <div style={{ background:'#F0F7FF', borderBottom:'1px solid #DBEAFE', padding:'7px 14px', fontSize:'11px', fontWeight:600, color:'#2563EB', letterSpacing:'1.2px', textTransform:'uppercase' }}>
            Patient Information
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr' }}>
            {infoRows.map(([label, value], i) => (
              <div key={i} style={{
                padding:'8px 14px',
                background: Math.floor(i / 2) % 2 === 0 ? '#fff' : '#FAFAFE',
                borderBottom: i < infoRows.length - 2 ? '1px solid #F3F4F6' : 'none',
                borderRight: i % 2 === 0 ? '1px solid #F3F4F6' : 'none',
              }}>
                <div style={{ fontSize:'10px', color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'2px' }}>{label}</div>
                <div style={{ fontSize:'13px', fontWeight:500, color:'#1F2937' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── NOTE BOX ── */}
        <div style={{
          background:'#F0F7FF', border:'1px solid #BFDBFE', borderRadius:'4px',
          padding:'9px 13px', marginBottom:'22px',
          fontSize:'11.5px', color:'#374151', lineHeight:1.65,
        }}>
          <strong style={{ color:'#2563EB' }}>Note: </strong>
          This certificate is issued based on clinical examination and is intended solely for submission to the concerned authority. Any misuse of this document is subject to legal action.
        </div>

        {/* ── FOOTER ── */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
          <div>
            <div style={{ fontSize:'12px', color:'#6B7280', marginBottom:'5px' }}>
              Date of Issue:&nbsp;<strong style={{ color:'#1F2937' }}>{issuedDate}</strong>
            </div>
            <div style={{ fontSize:'12px', color:'#6B7280' }}>
              Place:&nbsp;<strong style={{ color:'#1F2937' }}>Mumbai, Maharashtra</strong>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'flex-end', gap:'28px' }}>
            {/* QR Code */}
            <div style={{ textAlign:'center' }}>
              <img
                src={qrUrl} alt='Scan to verify' width={68} height={68}
                style={{ display:'block', margin:'0 auto', border:'1px solid #E5E7EB', borderRadius:'4px', padding:'2px' }}
                onError={e => { e.target.style.display = 'none' }}
              />
              <div style={{ fontSize:'9px', color:'#9CA3AF', marginTop:'4px' }}>Scan to Verify</div>
            </div>
            {/* Signature */}
            <div style={{ textAlign:'center', minWidth:'155px' }}>
              <div style={{ height:'28px' }} />
              <div style={{ borderTop:'1px solid #6B7280', paddingTop:'7px' }}>
                <div style={{ fontSize:'14px', fontWeight:600, color:'#1F2937' }}>{docProfile?.name || 'Doctor Name'}</div>
                <div style={{ fontSize:'11px', color:'#6B7280', marginTop:'2px' }}>{docProfile?.degree || 'MBBS, MD'}</div>
                <div style={{ fontSize:'11px', color:'#6B7280' }}>{docProfile?.speciality || 'Specialist'}</div>
                <div style={{ fontSize:'10px', color:'#9CA3AF', marginTop:'3px' }}>Reg. No: {docProfile?.registrationNumber || 'MCI/2024/001'}</div>
                <div style={{ marginTop:'8px', fontSize:'10px', color:'#9CA3AF', border:'1px dashed #D1D5DB', padding:'4px 14px', borderRadius:'2px', fontStyle:'italic' }}>
                  Hospital Seal
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fine print */}
        <div style={{ borderTop:'0.5px solid #E5E7EB', marginTop:'16px', paddingTop:'8px', display:'flex', justifyContent:'space-between' }}>
          <div style={{ fontSize:'9px', color:'#9CA3AF' }}>Computer-generated certificate. Valid for official submission only.</div>
          <div style={{ fontSize:'9px', color:'#9CA3AF' }}>{certNumber} | ID: {verificationId}</div>
        </div>

      </div>
    </div>
  )
}

// ─── Certificate Preview Screen (full-screen) ─────────────────────────────────
const CertificatePreviewScreen = ({
  cert, appointment, docProfile, certNumber, verificationId,
  onBack, onSave, saving,
}) => {
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
    <div className='fixed inset-0 z-[60] flex flex-col' style={{ background:'#F3F4F6' }}>
      {/* Top bar */}
      <div className='flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shadow-sm flex-shrink-0'>
        <div className='flex items-center gap-3'>
          <button
            onClick={onBack}
            className='flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors font-medium'
          >
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
            </svg>
            Back to Form
          </button>
          <span className='text-gray-200'>|</span>
          <div>
            <p className='text-sm font-semibold text-gray-800'>Certificate Preview</p>
            <p className='text-xs text-gray-400 font-mono'>{certNumber}</p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <button
            onClick={handlePrint}
            className='flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-all'
          >
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z' />
            </svg>
            Print / Save PDF
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className='flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all disabled:opacity-70 shadow-sm'
          >
            {saving ? (
              <>
                <svg className='animate-spin w-4 h-4' fill='none' viewBox='0 0 24 24'>
                  <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                  <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z' />
                </svg>
                Issuing...
              </>
            ) : (
              <>
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
                Issue Certificate
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preview area */}
      <div className='flex-1 overflow-auto py-8 px-4'>
        <div className='mx-auto shadow-2xl' style={{ width:'fit-content', borderRadius:'2px' }}>
          <MedicalCertificateDocument
            cert={cert}
            appointment={appointment}
            docProfile={docProfile}
            certNumber={certNumber}
            verificationId={verificationId}
          />
        </div>
      </div>

      <div className='px-6 py-2 bg-white border-t border-gray-100 text-center flex-shrink-0'>
        <p className='text-xs text-gray-400'>
          Use <strong className='text-gray-500'>Print / Save PDF</strong> to export this certificate as a PDF via your browser's print dialog.
        </p>
      </div>
    </div>
  )
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
const MedicalCertificateModal = ({ appointment, onClose }) => {
  const { saveMedicalCertificate, docProfile } = useContext(DoctorContext)
  const { slotDateFormat } = useContext(AppContext)

  const existing = appointment?.medicalCertificate || null
  const certNumber  = getCertNumber(appointment?._id)
  const verificationId = (appointment?._id || '').slice(-8).toUpperCase()

  // Form state
  const [patientName,  setPatientName]  = useState(existing?.patientName  || appointment?.userData?.name || '')
  const [age,          setAge]          = useState(existing?.age           || '')
  const [gender,       setGender]       = useState(existing?.gender        || appointment?.userData?.gender || '')
  const [diagnosis,    setDiagnosis]    = useState(existing?.diagnosis     || '')
  const [fitForDuty,   setFitForDuty]   = useState(existing?.fitForDuty   ?? true)
  const [examinationDate, setExaminationDate] = useState(existing?.examinationDate || new Date().toISOString().split('T')[0])
  const [fromDate,     setFromDate]     = useState(existing?.fromDate      || '')
  const [toDate,       setToDate]       = useState(existing?.toDate        || '')
  const [remarks,      setRemarks]      = useState(existing?.remarks       || '')
  const [issuedFor,    setIssuedFor]    = useState(existing?.issuedFor     || 'Office / School / College')
  const [saving,       setSaving]       = useState(false)
  const [showPreview,  setShowPreview]  = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const leaveDays = fromDate && toDate
    ? Math.max(0, Math.ceil((new Date(toDate) - new Date(fromDate)) / 86400000) + 1)
    : 0

  const getCertificate = () => ({
    patientName, age: String(age), gender, diagnosis,
    fitForDuty, examinationDate, fromDate, toDate,
    leaveDays: leaveDays > 0 ? String(leaveDays) : '',
    remarks, issuedFor,
  })

  const handleSave = async () => {
    if (!diagnosis.trim() && !fitForDuty) return alert('Please enter the diagnosis / medical condition.')
    setSaving(true)
    const ok = await saveMedicalCertificate(appointment._id, getCertificate())
    setSaving(false)
    if (ok) onClose()
  }

  const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all bg-white'
  const labelCls = 'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5'

  if (showPreview) {
    return (
      <CertificatePreviewScreen
        cert={{ ...getCertificate(), issuedAt: existing?.issuedAt }}
        appointment={appointment}
        docProfile={docProfile}
        certNumber={certNumber}
        verificationId={verificationId}
        onBack={() => setShowPreview(false)}
        onSave={handleSave}
        saving={saving}
      />
    )
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4'>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[94vh] flex flex-col overflow-hidden border border-gray-100'>

        {/* ── Header ── */}
        <div className='px-7 py-5 border-b border-gray-100 flex items-center justify-between bg-white'>
          <div className='flex items-center gap-3'>
            <div className='w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0'>
              <svg className='w-5 h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                  d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' />
              </svg>
            </div>
            <div>
              <h2 className='text-base font-bold text-gray-900'>Issue Medical Certificate</h2>
              <p className='text-xs text-gray-400 mt-0.5'>
                {appointment?.userData?.name} &nbsp;·&nbsp;
                {slotDateFormat(appointment?.slotDate)} at {appointment?.slotTime}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <span className='hidden sm:block text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded border border-gray-100'>{certNumber}</span>
            <button onClick={onClose} className='w-8 h-8 rounded-lg border border-gray-100 hover:bg-gray-50 flex items-center justify-center text-gray-400 transition-all text-xl'>×</button>
          </div>
        </div>

        {/* ── Existing cert banner ── */}
        {existing && (
          <div className='px-7 py-2.5 bg-blue-50 border-b border-blue-100 flex items-center gap-2 text-xs text-blue-700'>
            <svg className='w-4 h-4 text-blue-500 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
            </svg>
            Certificate issued on {fmt(existing.issuedAt)} — editing will re-issue.
          </div>
        )}

        {/* ── Form Body ── */}
        <div className='overflow-y-auto flex-1 px-7 py-6 space-y-5'>

          {/* Patient details row */}
          <div>
            <p className='text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2'>
              <span className='w-4 h-px bg-gray-200 inline-block'></span>
              Patient Details
              <span className='flex-1 h-px bg-gray-100 inline-block'></span>
            </p>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
              <div className='sm:col-span-1'>
                <label className={labelCls}>Full Name *</label>
                <input className={inputCls} value={patientName} onChange={e => setPatientName(e.target.value)} placeholder='Patient full name' />
              </div>
              <div>
                <label className={labelCls}>Age (years)</label>
                <input type='number' min='0' max='150' className={inputCls} value={age} onChange={e => setAge(e.target.value)} placeholder='e.g. 28' />
              </div>
              <div>
                <label className={labelCls}>Gender</label>
                <select className={inputCls} value={gender} onChange={e => setGender(e.target.value)}>
                  <option value=''>Select</option>
                  <option value='Male'>Male</option>
                  <option value='Female'>Female</option>
                  <option value='Other'>Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Clinical details */}
          <div>
            <p className='text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2'>
              <span className='w-4 h-px bg-gray-200 inline-block'></span>
              Clinical Details
              <span className='flex-1 h-px bg-gray-100 inline-block'></span>
            </p>
            <div className='space-y-4'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div>
                  <label className={labelCls}>Examination Date</label>
                  <input type='date' className={inputCls} value={examinationDate} onChange={e => setExaminationDate(e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Issued For</label>
                  <select className={inputCls} value={issuedFor} onChange={e => setIssuedFor(e.target.value)}>
                    <option value='Office / School / College'>Office / School / College</option>
                    <option value='Office'>Office / Workplace</option>
                    <option value='School'>School</option>
                    <option value='College / University'>College / University</option>
                    <option value='Government Authority'>Government Authority</option>
                    <option value='Other'>Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls}>Diagnosis / Medical Condition</label>
                <input
                  className={inputCls}
                  value={diagnosis}
                  onChange={e => setDiagnosis(e.target.value)}
                  placeholder='e.g. Acute Viral Fever, Post-operative recovery, Lower Back Pain…'
                />
              </div>
            </div>
          </div>

          {/* Fitness status */}
          <div>
            <label className={labelCls}>Fitness Status</label>
            <div className='grid grid-cols-2 gap-3'>
              <button
                type='button'
                onClick={() => setFitForDuty(true)}
                className={`py-3 rounded-xl text-sm font-semibold border-2 transition-all flex items-center justify-center gap-2 ${
                  fitForDuty
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100'
                    : 'bg-white border-gray-200 text-gray-500 hover:border-blue-300'
                }`}
              >
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M5 13l4 4L19 7' />
                </svg>
                Fit for Duty
              </button>
              <button
                type='button'
                onClick={() => setFitForDuty(false)}
                className={`py-3 rounded-xl text-sm font-semibold border-2 transition-all flex items-center justify-center gap-2 ${
                  !fitForDuty
                    ? 'bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-100'
                    : 'bg-white border-gray-200 text-gray-500 hover:border-amber-300'
                }`}
              >
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728' />
                </svg>
                Unfit – Rest Required
              </button>
            </div>
          </div>

          {/* Leave period */}
          <div>
            <label className={`${labelCls} flex items-center gap-2`}>
              Leave / Rest Period
              {leaveDays > 0 && (
                <span className='normal-case tracking-normal font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full text-xs'>
                  {leaveDays} day{leaveDays > 1 ? 's' : ''}
                </span>
              )}
            </label>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <p className='text-xs text-gray-400 mb-1'>From Date</p>
                <input type='date' className={inputCls} value={fromDate} onChange={e => setFromDate(e.target.value)} />
              </div>
              <div>
                <p className='text-xs text-gray-400 mb-1'>To Date</p>
                <input type='date' className={inputCls} value={toDate} min={fromDate} onChange={e => setToDate(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className={`${labelCls}`}>
              Remarks &nbsp;<span className='normal-case tracking-normal font-normal text-gray-300'>(optional)</span>
            </label>
            <textarea
              className={inputCls + ' resize-none'}
              rows={3}
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              placeholder='e.g. Patient requires complete bed rest. Avoid strenuous activity. Follow up after 7 days.'
            />
          </div>

        </div>

        {/* ── Footer ── */}
        <div className='px-7 py-4 border-t border-gray-100 bg-gray-50/60 flex flex-col sm:flex-row items-center gap-3 rounded-b-2xl'>
          <button
            onClick={() => setShowPreview(true)}
            className='flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-blue-200 text-blue-600 font-semibold text-sm hover:bg-blue-50 transition-all w-full sm:w-auto justify-center'
          >
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
            </svg>
            Preview Certificate
          </button>

          <div className='flex gap-3 w-full sm:w-auto sm:ml-auto'>
            <button
              onClick={onClose}
              className='flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-100 transition-all'
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className='flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-md shadow-blue-100'
            >
              {saving ? (
                <>
                  <svg className='animate-spin w-4 h-4' fill='none' viewBox='0 0 24 24'>
                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                    <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z' />
                  </svg>
                  Issuing…
                </>
              ) : 'Issue Certificate'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default MedicalCertificateModal
