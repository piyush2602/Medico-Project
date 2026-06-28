import React from 'react'
import logo from '../assets/logo.svg'

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const getCertNumber = (appointmentId) => {
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

// ─── Certificate Document Component ───────────────────────────────────────────
// Self-contained with inline styles for print accuracy.
const CertificateDocument = ({ cert, appointment, docProfile, certNumber, verificationId }) => {
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
    ['Patient Name',        patientName],
    ['Age',                 cert.age ? `${cert.age} years` : 'N/A'],
    ['Gender',              cert.gender || 'N/A'],
    ['Patient ID',          (appointment?._id || '').slice(-8).toUpperCase() || 'N/A'],
    ['Diagnosis / Condition', cert.diagnosis || (cert.fitForDuty ? 'Medically Fit' : 'N/A')],
    ['Examination Date',      examDate],
    ['Leave From',          cert.fromDate ? fmt(cert.fromDate) : 'N/A'],
    ['Leave To',            cert.toDate   ? fmt(cert.toDate)   : 'N/A'],
    ['Total Leave Days',    cert.leaveDays ? `${cert.leaveDays} day(s)` : 'N/A'],
    ['Fitness Status',      cert.fitForDuty ? 'Fit for Duty / Work' : 'Unfit – Rest Advised'],
    ['Issued For',          cert.issuedFor || 'Office / School / College'],
    ['Remarks',             cert.remarks || '—'],
  ]

  /* ── inline style tokens ─────────────────────────────────────── */
  const s = {
    page: {
      position: 'relative', background: '#fff',
      width: '210mm', minHeight: '297mm',
      padding: '16mm 18mm 14mm',
      fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
      fontSize: '14px', color: '#1F2937',
      boxSizing: 'border-box', margin: '0 auto',
    },
    outerBorder: {
      position: 'absolute', top: '7mm', left: '7mm', right: '7mm', bottom: '7mm',
      border: '1px solid #E5E7EB', pointerEvents: 'none', zIndex: 0,
    },
    innerBorder: {
      position: 'absolute', top: '9.5mm', left: '9.5mm', right: '9.5mm', bottom: '9.5mm',
      border: '0.5px solid #BFDBFE', pointerEvents: 'none', zIndex: 0,
    },
    watermark: {
      position: 'absolute', top: '50%', left: '50%',
      transform: 'translate(-50%,-50%) rotate(-45deg)',
      fontSize: '96px', fontWeight: 900, letterSpacing: '10px',
      color: 'rgba(37,99,235,0.035)', whiteSpace: 'nowrap',
      pointerEvents: 'none', userSelect: 'none', zIndex: 0,
    },
    content: { position: 'relative', zIndex: 1 },
    logoBox: {
      width: '52px', height: '52px', borderRadius: '8px', flexShrink: 0,
      background: 'linear-gradient(135deg,#2563EB 0%,#1d4ed8 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    dividerBlue: { borderTop: '2px solid #2563EB', marginBottom: '3px' },
    dividerLight: { borderTop: '0.5px solid #DBEAFE', marginBottom: '16px' },
    sectionHeading: {
      background: '#F0F7FF', borderBottom: '1px solid #DBEAFE',
      padding: '7px 14px', fontSize: '11px', fontWeight: 600,
      color: '#2563EB', letterSpacing: '1.2px', textTransform: 'uppercase',
    },
  }

  return (
    <div id='medical-certificate-doc' style={s.page}>
      <div style={s.outerBorder} />
      <div style={s.innerBorder} />
      <div style={s.watermark}>MEDICO</div>

      <div style={s.content}>

        {/* ── HEADER ── */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'14px' }}>
          {/* Left: Brand */}
          <div style={{ display:'flex', gap:'14px', alignItems:'flex-start' }}>
            <img src={logo} alt='Medico Logo' style={{ height: '48px', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize:'24px', fontWeight:700, color:'#1F2937', lineHeight:1.15 }}>
                Medico Healthcare
              </div>
              <div style={{ fontSize:'11px', color:'#6B7280', marginTop:'3px' }}>
                Advanced Medical Centre &amp; Diagnostic Hub
              </div>
              <div style={{ fontSize:'11px', color:'#6B7280', marginTop:'7px', lineHeight:1.75 }}>
                123 Health Avenue, Medical District, Mumbai – 400001<br />
                +91 98765 43210 &nbsp;|&nbsp; care@medico.health &nbsp;|&nbsp; www.medico.health
              </div>
            </div>
          </div>
          {/* Right: Doctor */}
          <div style={{ textAlign:'right', paddingTop:'2px' }}>
            <div style={{ fontSize:'15px', fontWeight:600, color:'#1F2937' }}>
              {docProfile?.name || 'Doctor Name'}
            </div>
            <div style={{ fontSize:'11px', color:'#6B7280', marginTop:'3px' }}>
              {docProfile?.degree || 'MBBS, MD'}
            </div>
            <div style={{ fontSize:'11px', color:'#6B7280' }}>
              {docProfile?.speciality || 'Specialist'}
            </div>
            <div style={{ fontSize:'10.5px', color:'#9CA3AF', marginTop:'5px' }}>
              Reg. No: {docProfile?.registrationNumber || 'MCI/2024/001'}
            </div>
          </div>
        </div>

        {/* Dividers */}
        <div style={s.dividerBlue} />
        <div style={s.dividerLight} />

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
          <div style={{ fontSize:'20px', fontWeight:700, letterSpacing:'4px', color:'#1F2937' }}>
            MEDICAL CERTIFICATE
          </div>
          <div style={{ fontSize:'12px', color:'#6B7280', fontStyle:'italic', marginTop:'5px' }}>
            (To Whom It May Concern)
          </div>
          <div style={{ width:'48px', height:'2.5px', background:'#2563EB', margin:'9px auto 0', borderRadius:'2px' }} />
        </div>

        {/* ── BODY PARAGRAPH ── */}
        <div style={{ fontSize:'14px', lineHeight:1.85, color:'#374151', textAlign:'justify', marginBottom:'20px', padding:'0 2mm' }}>
          {bodyText}
        </div>

        {/* ── PATIENT INFO TABLE ── */}
        <div style={{ border:'1px solid #E5E7EB', borderRadius:'6px', overflow:'hidden', marginBottom:'16px' }}>
          <div style={s.sectionHeading}>Patient Information</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr' }}>
            {infoRows.map(([label, value], i) => (
              <div
                key={i}
                style={{
                  padding:'8px 14px',
                  background: Math.floor(i / 2) % 2 === 0 ? '#fff' : '#FAFAFE',
                  borderBottom: i < infoRows.length - 2 ? '1px solid #F3F4F6' : 'none',
                  borderRight: i % 2 === 0 ? '1px solid #F3F4F6' : 'none',
                }}
              >
                <div style={{ fontSize:'10px', color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'2px' }}>
                  {label}
                </div>
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
          {/* Left: date + place */}
          <div>
            <div style={{ fontSize:'12px', color:'#6B7280', marginBottom:'5px' }}>
              Date of Issue:&nbsp;<strong style={{ color:'#1F2937' }}>{issuedDate}</strong>
            </div>
            <div style={{ fontSize:'12px', color:'#6B7280' }}>
              Place:&nbsp;<strong style={{ color:'#1F2937' }}>Mumbai, Maharashtra</strong>
            </div>
          </div>
          {/* Right: QR + Signature */}
          <div style={{ display:'flex', alignItems:'flex-end', gap:'28px' }}>
            {/* QR */}
            <div style={{ textAlign:'center' }}>
              <img src={qrUrl} alt='Scan to verify' width={68} height={68}
                style={{ display:'block', margin:'0 auto', border:'1px solid #E5E7EB', borderRadius:'4px', padding:'2px' }}
                onError={e => { e.target.style.display = 'none' }}
              />
              <div style={{ fontSize:'9px', color:'#9CA3AF', marginTop:'4px' }}>Scan to Verify</div>
            </div>
            {/* Signature block */}
            <div style={{ textAlign:'center', minWidth:'155px' }}>
              <div style={{ height:'28px' }} />{/* signature space */}
              <div style={{ borderTop:'1px solid #6B7280', paddingTop:'7px' }}>
                <div style={{ fontSize:'14px', fontWeight:600, color:'#1F2937' }}>
                  {docProfile?.name || 'Doctor Name'}
                </div>
                <div style={{ fontSize:'11px', color:'#6B7280', marginTop:'2px' }}>
                  {docProfile?.degree || 'MBBS, MD'}
                </div>
                <div style={{ fontSize:'11px', color:'#6B7280' }}>
                  {docProfile?.speciality || 'Specialist'}
                </div>
                <div style={{ fontSize:'10px', color:'#9CA3AF', marginTop:'3px' }}>
                  Reg. No: {docProfile?.registrationNumber || 'MCI/2024/001'}
                </div>
                <div style={{
                  marginTop:'8px', fontSize:'10px', color:'#9CA3AF',
                  border:'1px dashed #D1D5DB', padding:'4px 14px',
                  borderRadius:'2px', fontStyle:'italic',
                }}>
                  Hospital Seal
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fine print */}
        <div style={{
          borderTop:'0.5px solid #E5E7EB', marginTop:'16px', paddingTop:'8px',
          display:'flex', justifyContent:'space-between',
        }}>
          <div style={{ fontSize:'9px', color:'#9CA3AF' }}>
            Computer-generated certificate. Valid for official submission only.
          </div>
          <div style={{ fontSize:'9px', color:'#9CA3AF' }}>
            {certNumber} | ID: {verificationId}
          </div>
        </div>

      </div>
    </div>
  )
}

export default CertificateDocument
