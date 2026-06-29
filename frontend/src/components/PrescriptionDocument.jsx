import React from 'react'
import logo from '../assets/logo.svg'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (dateStr) => {
  if (!dateStr) return 'N/A'
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    })
  } catch { return dateStr }
}

// ─── Prescription Document Component ───────────────────────────────────────────
const PrescriptionDocument = ({ item, slotDateFormat }) => {
  if (!item || !item.prescription) return null

  const rx = item.prescription
  const d = item.docData
  const pat = item.userData
  const dateFmt = slotDateFormat ? slotDateFormat(item.slotDate) : item.slotDate
  const rxId = (item._id || '').slice(-8).toUpperCase()
  
  const qrData = encodeURIComponent(`RX:${rxId}|Date:${item.slotDate}`)
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${qrData}&bgcolor=ffffff&color=4f46e5&margin=4`

  /* ── inline style tokens ─────────────────────────────────────── */
  const s = {
    page: {
      position: 'relative', background: '#fff',
      width: '210mm', minHeight: '297mm',
      padding: '0',
      fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
      fontSize: '14px', color: '#1F2937',
      boxSizing: 'border-box', margin: '0 auto',
    },
    headerBand: {
      background: '#4F46E5', color: '#fff',
      padding: '16mm 18mm',
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
    },
    content: {
      padding: '10mm 18mm 14mm',
    },
    sectionHeading: {
      fontSize: '12px', fontWeight: 700, color: '#4F46E5',
      borderBottom: '1px solid #4F46E5', paddingBottom: '4px', marginBottom: '12px',
      textTransform: 'uppercase', letterSpacing: '1px'
    }
  }

  return (
    <div id='prescription-doc' style={s.page}>
      {/* ── HEADER BAND ── */}
      <div style={s.headerBand}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
           <div style={{ width: '48px', height: '48px', background: '#fff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={logo} alt='Medico Logo' style={{ height: '32px' }} />
           </div>
           <div>
              <div style={{ fontSize: '28px', fontWeight: 800, lineHeight: 1 }}>Medico</div>
              <div style={{ fontSize: '11px', opacity: 0.9, marginTop: '4px', letterSpacing: '0.5px' }}>DIGITAL HEALTHCARE PLATFORM</div>
           </div>
        </div>
        <div style={{ textAlign: 'right' }}>
           <div style={{ fontSize: '16px', fontWeight: 700 }}>{d?.name || 'Doctor Name'}</div>
           <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.9 }}>{d?.speciality} | {d?.degree}</div>
           <div style={{ fontSize: '11px', marginTop: '2px', opacity: 0.9 }}>Exp: {d?.experience}</div>
        </div>
      </div>

      <div style={s.content}>
        
        {/* ── PATIENT INFO BOX ── */}
        <div style={{ background: '#F5F7FF', borderRadius: '6px', padding: '14px', marginBottom: '24px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#3C3C50', marginBottom: '8px' }}>PATIENT INFORMATION</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px', color: '#1F2937' }}>
             <div><strong style={{ color: '#6B7280' }}>Name:</strong> {pat?.name || 'N/A'}</div>
             <div><strong style={{ color: '#6B7280' }}>Phone:</strong> {pat?.phone || 'N/A'}</div>
             <div><strong style={{ color: '#6B7280' }}>Date & Time:</strong> {dateFmt} | {item.slotTime}</div>
             <div><strong style={{ color: '#6B7280' }}>Gender:</strong> {pat?.gender || 'N/A'}</div>
             {rx.patientWeight && <div><strong style={{ color: '#6B7280' }}>Weight:</strong> {rx.patientWeight} kg</div>}
          </div>
        </div>

        {/* ── PRESCRIPTION TITLE ── */}
        <div style={s.sectionHeading}>PRESCRIPTION</div>

        {/* ── DIAGNOSIS ── */}
        {rx.diagnosedDisease && (
          <div style={{ background: '#FFF3E6', borderRadius: '4px', padding: '10px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#B45014' }}>Diagnosis:</span>
            <span style={{ fontSize: '12px', color: '#64280A', fontWeight: 500 }}>{rx.diagnosedDisease}</span>
          </div>
        )}

        {/* ── MEDICINES TABLE ── */}
        {rx.medicines && rx.medicines.length > 0 && (
          <div style={{ marginBottom: '24px', border: '1px solid #E5E7EB', borderRadius: '6px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '11px' }}>
              <thead>
                <tr style={{ background: '#4F46E5', color: '#fff' }}>
                  <th style={{ padding: '8px 14px', fontWeight: 600 }}>Medicine Name</th>
                  <th style={{ padding: '8px 14px', fontWeight: 600 }}>Dosage</th>
                  <th style={{ padding: '8px 14px', fontWeight: 600 }}>Frequency</th>
                  <th style={{ padding: '8px 14px', fontWeight: 600 }}>Duration</th>
                </tr>
              </thead>
              <tbody>
                {rx.medicines.map((med, idx) => (
                  <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#F8F9FF', borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '10px 14px', color: '#323246', fontWeight: 500 }}>{med.name}</td>
                    <td style={{ padding: '10px 14px', color: '#4B5563' }}>{med.dosage}</td>
                    <td style={{ padding: '10px 14px', color: '#4B5563' }}>{med.frequency}</td>
                    <td style={{ padding: '10px 14px', color: '#4B5563' }}>{med.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── INSTRUCTIONS ── */}
        {rx.instructions && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#4F46E5', marginBottom: '6px' }}>Instructions</div>
            <div style={{ fontSize: '11px', color: '#3C3C50', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {rx.instructions}
            </div>
          </div>
        )}

        {/* ── FOLLOW UP ── */}
        {rx.followUpDate && (
          <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#4F46E5' }}>Follow-up Date:</div>
            <div style={{ fontSize: '12px', color: '#3C3C50', fontWeight: 500 }}>{fmt(rx.followUpDate)}</div>
          </div>
        )}

        {/* ── NOTES ── */}
        {rx.notes && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#4F46E5', marginBottom: '6px' }}>Notes</div>
            <div style={{ fontSize: '11px', color: '#3C3C50', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {rx.notes}
            </div>
          </div>
        )}

      </div>

      {/* ── FOOTER ── */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
        
        {/* Signature Box */}
        <div style={{ padding: '0 18mm 20mm', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
           <div>
             <img src={qrUrl} alt='QR Code' width={72} height={72} style={{ border: '1px solid #E5E7EB', padding: '4px', borderRadius: '6px' }} />
             <div style={{ fontSize: '9px', color: '#9CA3AF', marginTop: '4px', textAlign: 'center' }}>Scan to Verify</div>
           </div>
           <div style={{ textAlign: 'center', minWidth: '160px' }}>
              <div style={{ borderBottom: '1px solid #9CA3AF', marginBottom: '6px', height: '40px' }}></div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#1F2937' }}>{d?.name}</div>
              <div style={{ fontSize: '9px', color: '#6B7280', marginTop: '2px' }}>Doctor's Signature</div>
           </div>
        </div>

        {/* Bottom Banner */}
        <div style={{ background: '#F5F7FF', padding: '12px', textAlign: 'center', borderTop: '1px solid #E5E7EB' }}>
           <div style={{ fontSize: '10px', color: '#6B7280' }}>
             This prescription is computer-generated by Medico Digital Healthcare Platform.
           </div>
           <div style={{ fontSize: '10px', color: '#6B7280', marginTop: '2px' }}>
             Please consult your doctor for any queries. | Ref: {rxId}
           </div>
        </div>
      </div>
      
    </div>
  )
}

export default PrescriptionDocument
