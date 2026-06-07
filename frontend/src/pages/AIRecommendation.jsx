import React, { useState, useRef, useContext } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

// ─── Severity config ──────────────────────────────────────────────────────────
const SEVERITY_CONFIG = {
  LOW:      { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  ring: '#22c55e', label: 'Low Risk',      icon: '🟢', advice: 'Schedule a routine appointment at your convenience.' },
  MEDIUM:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', ring: '#f59e0b', label: 'Moderate Risk', icon: '🟡', advice: 'Book an appointment within the next few days.' },
  HIGH:     { color: '#f97316', bg: 'rgba(249,115,22,0.12)', ring: '#f97316', label: 'High Risk',     icon: '🟠', advice: 'Seek medical attention within 24–48 hours.' },
  CRITICAL: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  ring: '#ef4444', label: 'Critical',      icon: '🔴', advice: 'Seek emergency care IMMEDIATELY or call an ambulance.' },
}

// ─── Engine badge config ──────────────────────────────────────────────────────
const ENGINE_CONFIG = {
  gemini:  { label: 'Gemini AI',     icon: '🤖', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.35)', desc: 'Powered by Google Gemini LLM' },
  ml:      { label: 'ML Model',      icon: '🧠', color: '#38bdf8', bg: 'rgba(56,189,248,0.12)',  border: 'rgba(56,189,248,0.35)',  desc: 'Powered by trained Naive Bayes classifier' },
  keyword: { label: 'Keyword Match', icon: '🔍', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.35)',  desc: 'Using rule-based keyword matching' },
}

const SYMPTOM_CHIPS = [
  'Severe headache & migraine',
  'Skin rash & itching',
  'Stomach pain & acid reflux',
  'My child has fever',
  'Irregular periods / PCOS',
  'Chest pain & shortness of breath',
  'Memory loss & confusion',
  'Tooth pain & swollen gums',
  'Knee pain & joint injury',
  'Heart palpitations',
]

const SPECIALITY_ICONS = {
  'General physician':   '🩺',
  'Gynecologist':        '👩‍⚕️',
  'Dermatologist':       '🧴',
  'Pediatricians':       '👶',
  'Neurologist':         '🧠',
  'Gastroenterologist':  '🫀',
  'Dentist':             '🦷',
  'Orthopedic':          '🦴',
  'Cardiologist':        '🫀',
}

// ─── Animated spinner ─────────────────────────────────────────────────────────
const Spinner = ({ text }) => (
  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'18px', padding:'40px 0' }}>
    <div style={{
      width:'52px', height:'52px', borderRadius:'50%',
      border:'4px solid rgba(99,102,241,0.2)',
      borderTop:'4px solid #6366f1',
      animation:'spin 0.8s linear infinite'
    }} />
    <p style={{ color:'#94a3b8', fontSize:'0.95rem', fontWeight:500 }}>{text}</p>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
)

// ─── Lab value row ────────────────────────────────────────────────────────────
const LAB_STATUS_CFG = {
  LOW:    { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.3)',  icon: '↓', label: 'LOW' },
  HIGH:   { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)',   icon: '↑', label: 'HIGH' },
  NORMAL: { color: '#22c55e', bg: 'rgba(34,197,94,0.10)',   border: 'rgba(34,197,94,0.25)',  icon: '✓', label: 'NORMAL' },
}
const LabValueRow = ({ lv }) => {
  const cfg = LAB_STATUS_CFG[lv.status] || LAB_STATUS_CFG.NORMAL
  return (
    <div style={{
      display:'grid', gridTemplateColumns:'1fr auto auto auto',
      gap:'8px', alignItems:'center', padding:'10px 14px',
      borderBottom:'1px solid rgba(255,255,255,0.05)'
    }}>
      <p style={{ color:'#e2e8f0', fontSize:'0.85rem', fontWeight:600, margin:0 }}>{lv.parameter}</p>
      <p style={{ color:'#f1f5f9', fontSize:'0.85rem', fontWeight:700, margin:0, textAlign:'right' }}>
        {lv.value} <span style={{ color:'#64748b', fontSize:'0.75rem', fontWeight:400 }}>{lv.unit}</span>
      </p>
      <p style={{ color:'#475569', fontSize:'0.75rem', margin:0, textAlign:'right' }}>
        {lv.referenceRange}
      </p>
      <span style={{
        padding:'3px 10px', borderRadius:'999px', fontSize:'0.72rem', fontWeight:700,
        background: cfg.bg, color: cfg.color, border:`1px solid ${cfg.border}`,
        whiteSpace:'nowrap', minWidth:'68px', textAlign:'center'
      }}>
        {cfg.icon} {cfg.label}
      </span>
    </div>
  )
}

// ─── Severity gauge ───────────────────────────────────────────────────────────
const SeverityGauge = ({ score, level }) => {
  const cfg = SEVERITY_CONFIG[level] || SEVERITY_CONFIG.MEDIUM
  const radius = 54
  const circ = 2 * Math.PI * radius
  const dash = (score / 100) * circ
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'10px' }}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" />
        <circle cx="70" cy="70" r={radius} fill="none" stroke={cfg.color} strokeWidth="14"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 70 70)"
          style={{ transition:'stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)', filter:`drop-shadow(0 0 8px ${cfg.color})` }}
        />
        <text x="70" y="66" textAnchor="middle" fill="white" fontSize="22" fontWeight="700">{score}</text>
        <text x="70" y="84" textAnchor="middle" fill="#94a3b8" fontSize="11">/100</text>
      </svg>
      <span style={{
        padding:'5px 18px', borderRadius:'999px', fontSize:'0.8rem', fontWeight:700,
        background: cfg.bg, color: cfg.color, border:`1px solid ${cfg.color}40`,
        letterSpacing:'0.08em', textTransform:'uppercase'
      }}>
        {cfg.icon} {cfg.label}
      </span>
    </div>
  )
}

// ─── Doctor card ──────────────────────────────────────────────────────────────
const DoctorCard = ({ doc }) => {
  const { currencySymbol } = useContext(AppContext)
  const navigate = useNavigate()
  return (
    <div onClick={() => { navigate(`/appointment/${doc._id}`); window.scrollTo(0,0) }}
      style={{
        background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)',
        borderRadius:'16px', padding:'18px', display:'flex', gap:'16px',
        cursor:'pointer', transition:'all 0.25s', alignItems:'flex-start'
      }}
      onMouseEnter={e => { e.currentTarget.style.background='rgba(99,102,241,0.12)'; e.currentTarget.style.borderColor='rgba(99,102,241,0.4)'; e.currentTarget.style.transform='translateY(-3px)' }}
      onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; e.currentTarget.style.transform='translateY(0)' }}
    >
      <img src={doc.image} alt={doc.name} style={{ width:'68px', height:'68px', borderRadius:'12px', objectFit:'cover', flexShrink:0, background:'#1e293b' }} />
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontWeight:700, color:'#f1f5f9', fontSize:'0.95rem', marginBottom:'3px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{doc.name}</p>
        <p style={{ color:'#6366f1', fontSize:'0.78rem', fontWeight:600, marginBottom:'6px' }}>{doc.speciality}</p>
        <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
          <span style={{ background:'rgba(99,102,241,0.15)', color:'#a5b4fc', borderRadius:'6px', padding:'2px 8px', fontSize:'0.72rem', fontWeight:600 }}>{doc.experience}</span>
          <span style={{ background:'rgba(34,197,94,0.12)', color:'#86efac', borderRadius:'6px', padding:'2px 8px', fontSize:'0.72rem', fontWeight:600 }}>{currencySymbol}{doc.fees} / visit</span>
          <span style={{ background: doc.available ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)', color: doc.available ? '#86efac' : '#fca5a5', borderRadius:'6px', padding:'2px 8px', fontSize:'0.72rem', fontWeight:600 }}>{doc.available ? '● Available' : '● Unavailable'}</span>
        </div>
      </div>
      <button style={{
        flexShrink:0, padding:'8px 14px', borderRadius:'10px', border:'none',
        background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'white',
        fontSize:'0.75rem', fontWeight:700, cursor:'pointer', whiteSpace:'nowrap'
      }}>
        Book →
      </button>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
const AIRecommendation = () => {
  const { backendUrl } = useContext(AppContext)
  const [activeTab, setActiveTab] = useState('symptom')

  // Symptom tab state
  const [symptoms, setSymptoms] = useState('')
  const [symptomLoading, setSymptomLoading] = useState(false)
  const [symptomResult, setSymptomResult] = useState(null)
  const [symptomError, setSymptomError] = useState('')

  // Report tab state
  const [pdfFile, setPdfFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [reportLoading, setReportLoading] = useState(false)
  const [reportResult, setReportResult] = useState(null)
  const [reportError, setReportError] = useState('')
  const fileInputRef = useRef(null)

  // ── Symptom analysis ──────────────────────────────────────────────────────
  const handleSymptomSubmit = async () => {
    if (!symptoms.trim()) return
    setSymptomLoading(true)
    setSymptomResult(null)
    setSymptomError('')
    try {
      const { data } = await axios.post(backendUrl + '/api/doctor/recommend', { symptoms })
      if (data.success) setSymptomResult(data)
      else setSymptomError(data.message)
    } catch (e) {
      setSymptomError('Failed to connect to AI service. Please try again.')
    } finally {
      setSymptomLoading(false)
    }
  }

  // ── PDF / Image analysis ───────────────────────────────────────────────────
  const ACCEPTED_TYPES = ['application/pdf','image/jpeg','image/jpg','image/png','image/webp']
  const handleFileChange = (file) => {
    if (file && ACCEPTED_TYPES.includes(file.type)) {
      setPdfFile(file); setReportResult(null); setReportError('')
    } else {
      setReportError('Please select a PDF or image file (JPG, PNG, WEBP).')
    }
  }

  const handleReportSubmit = async () => {
    if (!pdfFile) return
    setReportLoading(true)
    setReportResult(null)
    setReportError('')
    try {
      const formData = new FormData()
      formData.append('report', pdfFile)
      const { data } = await axios.post(backendUrl + '/api/doctor/analyze-report', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      if (data.success) setReportResult(data)
      else setReportError(data.message)
    } catch (e) {
      setReportError('Failed to analyze report. Please try again.')
    } finally {
      setReportLoading(false)
    }
  }

  const s = { // shorthand styles
    page:     { minHeight:'100vh', padding:'40px 0 80px', fontFamily:"'Inter','Segoe UI',sans-serif" },
    heading:  { fontSize:'clamp(1.6rem,4vw,2.5rem)', fontWeight:800, background:'linear-gradient(135deg,#818cf8,#c084fc,#f472b6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', textAlign:'center', marginBottom:'10px' },
    subhead:  { color:'#94a3b8', textAlign:'center', fontSize:'1rem', marginBottom:'36px' },
    card:     { background:'rgba(15,23,42,0.85)', backdropFilter:'blur(20px)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:'24px', padding:'32px', marginBottom:'24px', boxShadow:'0 20px 60px rgba(0,0,0,0.4)' },
    label:    { color:'#cbd5e1', fontWeight:600, fontSize:'0.85rem', marginBottom:'8px', display:'block' },
    textarea: { width:'100%', minHeight:'110px', padding:'14px 16px', background:'rgba(255,255,255,0.04)', border:'1.5px solid rgba(99,102,241,0.3)', borderRadius:'12px', color:'#f1f5f9', fontSize:'0.95rem', resize:'vertical', outline:'none', fontFamily:'inherit', boxSizing:'border-box', transition:'border-color 0.2s' },
    btnPrimary: { padding:'13px 32px', borderRadius:'12px', border:'none', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'white', fontWeight:700, fontSize:'0.95rem', cursor:'pointer', transition:'all 0.2s', letterSpacing:'0.02em' },
    chip:     { padding:'7px 14px', borderRadius:'999px', border:'1.5px solid rgba(99,102,241,0.35)', background:'rgba(99,102,241,0.08)', color:'#a5b4fc', fontSize:'0.78rem', fontWeight:600, cursor:'pointer', transition:'all 0.2s', whiteSpace:'nowrap' },
    resultCard: { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:'16px', padding:'22px' },
    tag:      { padding:'5px 14px', borderRadius:'999px', fontSize:'0.78rem', fontWeight:700, background:'rgba(99,102,241,0.15)', color:'#a5b4fc', border:'1px solid rgba(99,102,241,0.3)' },
    sectionTitle: { color:'#94a3b8', fontSize:'0.78rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'12px' },
  }

  const tabStyle = (active) => ({
    flex:1, padding:'12px 20px', borderRadius:'12px', border:'none', cursor:'pointer',
    fontWeight:700, fontSize:'0.9rem', transition:'all 0.25s',
    background: active ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'transparent',
    color: active ? 'white' : '#64748b',
    boxShadow: active ? '0 4px 20px rgba(99,102,241,0.4)' : 'none'
  })

  return (
    <div style={s.page}>
      {/* Page Header */}
      <div style={{ textAlign:'center', marginBottom:'8px' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.3)', borderRadius:'999px', padding:'6px 16px', marginBottom:'20px' }}>
          <span>✨</span>
          <span style={{ color:'#a5b4fc', fontSize:'0.8rem', fontWeight:600 }}>AI-Powered Medical Intelligence</span>
        </div>
        <h1 style={s.heading}>AI Doctor Recommendation</h1>
        <p style={s.subhead}>Describe your symptoms or upload a medical report — our AI will guide you to the right specialist.</p>
      </div>

      {/* Tab Switcher */}
      <div style={{ maxWidth:'680px', margin:'0 auto 32px', display:'flex', gap:'8px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'16px', padding:'6px' }}>
        <button style={tabStyle(activeTab==='symptom')} onClick={()=>{ setActiveTab('symptom'); setSymptomResult(null); setSymptomError('') }}>
          🩺 Symptom Analyzer
        </button>
        <button style={tabStyle(activeTab==='report')} onClick={()=>{ setActiveTab('report'); setReportResult(null); setReportError('') }}>
          📋 Report Analyzer
        </button>
      </div>

      <div style={{ maxWidth:'780px', margin:'0 auto' }}>

        {/* ════════════════ SYMPTOM TAB ════════════════ */}
        {activeTab === 'symptom' && (
          <>
            <div style={s.card}>
              <p style={{ color:'#f1f5f9', fontWeight:700, fontSize:'1.1rem', marginBottom:'18px' }}>🩺 Describe Your Symptoms</p>

              {/* Quick chips */}
              <p style={s.label}>Quick select a common symptom:</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'8px', marginBottom:'20px' }}>
                {SYMPTOM_CHIPS.map(chip => (
                  <button key={chip} style={s.chip}
                    onClick={() => setSymptoms(prev => prev ? prev + ', ' + chip.toLowerCase() : chip.toLowerCase())}
                    onMouseEnter={e => { e.currentTarget.style.background='rgba(99,102,241,0.25)'; e.currentTarget.style.borderColor='rgba(99,102,241,0.7)' }}
                    onMouseLeave={e => { e.currentTarget.style.background='rgba(99,102,241,0.08)'; e.currentTarget.style.borderColor='rgba(99,102,241,0.35)' }}
                  >{chip}</button>
                ))}
              </div>

              <label style={s.label}>Or describe in detail:</label>
              <textarea
                style={s.textarea}
                placeholder="e.g. I've been having severe migraines and dizziness for the past 3 days, along with sensitivity to light..."
                value={symptoms}
                onChange={e => setSymptoms(e.target.value)}
                onFocus={e => e.target.style.borderColor='rgba(99,102,241,0.7)'}
                onBlur={e => e.target.style.borderColor='rgba(99,102,241,0.3)'}
              />

              <div style={{ marginTop:'20px', display:'flex', justifyContent:'flex-end' }}>
                <button
                  style={{ ...s.btnPrimary, opacity: (!symptoms.trim() || symptomLoading) ? 0.5 : 1 }}
                  onClick={handleSymptomSubmit}
                  disabled={!symptoms.trim() || symptomLoading}
                  onMouseEnter={e => { if(symptoms.trim() && !symptomLoading) e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 25px rgba(99,102,241,0.5)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='' }}
                >
                  {symptomLoading ? 'Analyzing...' : '✨ Get AI Recommendation'}
                </button>
              </div>
            </div>

            {/* Loading */}
            {symptomLoading && <div style={s.card}><Spinner text="AI is analyzing your symptoms…" /></div>}

            {/* Error */}
            {symptomError && <div style={{ ...s.card, border:'1px solid rgba(239,68,68,0.3)', background:'rgba(239,68,68,0.06)' }}><p style={{ color:'#fca5a5', textAlign:'center' }}>⚠️ {symptomError}</p></div>}

            {/* Result */}
            {symptomResult && !symptomLoading && (
              <div style={s.card}>

                {/* Engine badge */}
                {(() => {
                  const eng = ENGINE_CONFIG[symptomResult.engine] || ENGINE_CONFIG.keyword
                  return (
                    <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'20px',
                      background: eng.bg, border:`1px solid ${eng.border}`, borderRadius:'10px',
                      padding:'8px 14px', width:'fit-content' }}>
                      <span style={{ fontSize:'1rem' }}>{eng.icon}</span>
                      <div>
                        <span style={{ color: eng.color, fontWeight:700, fontSize:'0.8rem' }}>{eng.label}</span>
                        <span style={{ color:'#64748b', fontSize:'0.75rem', marginLeft:'8px' }}>{eng.desc}</span>
                      </div>
                    </div>
                  )
                })()}

                <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'24px', paddingBottom:'20px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize:'2.2rem' }}>{SPECIALITY_ICONS[symptomResult.speciality] || '🏥'}</span>
                  <div>
                    <p style={{ color:'#94a3b8', fontSize:'0.78rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.1em' }}>Recommended Specialist</p>
                    <p style={{ color:'#f1f5f9', fontWeight:800, fontSize:'1.4rem' }}>{symptomResult.speciality}</p>
                  </div>
                  <div style={{ marginLeft:'auto', display:'flex', flexDirection:'column', alignItems:'center' }}>
                    <div style={{ width:'52px', height:'52px', borderRadius:'50%', background:`conic-gradient(#6366f1 ${symptomResult.confidence * 3.6}deg, rgba(255,255,255,0.06) 0deg)`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:'#0f172a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.7rem', color:'#a5b4fc', fontWeight:700 }}>{symptomResult.confidence}%</div>
                    </div>
                    <span style={{ color:'#64748b', fontSize:'0.68rem', marginTop:'4px' }}>Confidence</span>
                  </div>
                </div>

                <div style={{ ...s.resultCard, marginBottom:'20px' }}>
                  <p style={s.sectionTitle}>AI Analysis</p>
                  <p style={{ color:'#cbd5e1', lineHeight:'1.7', fontSize:'0.95rem' }}>{symptomResult.explanation}</p>
                </div>

                {/* ML alternatives */}
                {symptomResult.engine === 'ml' && symptomResult.mlAlternatives && symptomResult.mlAlternatives.length > 0 && (
                  <div style={{ background:'rgba(56,189,248,0.06)', border:'1px solid rgba(56,189,248,0.2)', borderRadius:'12px', padding:'14px 18px', marginBottom:'20px' }}>
                    <p style={{ color:'#7dd3fc', fontSize:'0.78rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'10px' }}>
                      🧠 ML Model — Other Possible Specialties
                    </p>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                      {symptomResult.mlAlternatives.map(alt => (
                        <span key={alt.speciality} style={{ padding:'4px 12px', borderRadius:'999px', background:'rgba(56,189,248,0.12)',
                          border:'1px solid rgba(56,189,248,0.3)', color:'#7dd3fc', fontSize:'0.75rem', fontWeight:600 }}>
                          {alt.speciality} · {alt.confidence}%
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {!symptomResult.aiPowered && symptomResult.engine === 'keyword' && (
                  <div style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:'10px', padding:'10px 16px', marginBottom:'20px' }}>
                    <p style={{ color:'#fcd34d', fontSize:'0.8rem' }}>⚡ Using smart keyword matching. Start the ML service or add a GEMINI_API_KEY for smarter analysis.</p>
                  </div>
                )}

                <div style={{ background:'rgba(99,102,241,0.06)', border:'1px solid rgba(99,102,241,0.15)', borderRadius:'10px', padding:'10px 16px', marginBottom:'24px' }}>
                  <p style={{ color:'#94a3b8', fontSize:'0.78rem' }}>⚕️ <strong style={{color:'#64748b'}}>Medical Disclaimer:</strong> This is AI-generated guidance only and does not replace professional medical advice. Please consult a qualified doctor for diagnosis and treatment.</p>
                </div>

                {symptomResult.doctors && symptomResult.doctors.length > 0 && (
                  <>
                    <p style={s.sectionTitle}>Available {symptomResult.speciality}s Near You</p>
                    <div style={{ display:'grid', gap:'12px' }}>
                      {symptomResult.doctors.map(doc => <DoctorCard key={doc._id} doc={doc} />)}
                    </div>
                  </>
                )}
                {symptomResult.doctors && symptomResult.doctors.length === 0 && (
                  <p style={{ color:'#64748b', textAlign:'center', padding:'20px 0' }}>No available doctors found for this specialty right now. Please check back later or <a href="/doctors" style={{ color:'#818cf8' }}>browse all doctors</a>.</p>
                )}
              </div>
            )}
          </>
        )}

        {/* ════════════════ REPORT TAB ════════════════ */}
        {activeTab === 'report' && (
          <>
            <div style={s.card}>
              <p style={{ color:'#f1f5f9', fontWeight:700, fontSize:'1.1rem', marginBottom:'6px' }}>📋 Upload Your Medical Report</p>
              <p style={{ color:'#64748b', fontSize:'0.85rem', marginBottom:'22px' }}>Supports text-based <strong style={{color:'#94a3b8'}}>and</strong> scanned/image PDFs — blood tests, MRI reports, pathology, prescriptions — max 10 MB</p>

              {/* Drop zone */}
              <div
                style={{
                  border: `2.5px dashed ${dragOver ? '#6366f1' : 'rgba(99,102,241,0.35)'}`,
                  borderRadius:'16px',
                  padding:'40px 20px',
                  textAlign:'center',
                  cursor:'pointer',
                  background: dragOver ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.03)',
                  transition:'all 0.25s',
                  marginBottom:'20px'
                }}
                onClick={() => fileInputRef.current.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); handleFileChange(e.dataTransfer.files[0]) }}
              >
              <div style={{ fontSize:'3rem', marginBottom:'12px' }}>
                {pdfFile ? (pdfFile.type.startsWith('image/') ? '🖼️' : '📄') : '☁️'}
              </div>
                {pdfFile ? (
                  <>
                    <p style={{ color:'#a5b4fc', fontWeight:700, fontSize:'1rem' }}>{pdfFile.name}</p>
                    <p style={{ color:'#64748b', fontSize:'0.82rem', marginTop:'4px' }}>{(pdfFile.size / 1024).toFixed(1)} KB — Click to change</p>
                  </>
                ) : (
                  <>
                    <p style={{ color:'#94a3b8', fontWeight:600 }}>Drag & drop your PDF here</p>
                  <p style={{ color:'#475569', fontSize:'0.82rem', marginTop:'4px' }}>Drag & drop your file here</p>
                  <p style={{ color:'#334155', fontSize:'0.76rem', marginTop:'4px' }}>PDF, JPG, PNG, WEBP · Max 10 MB</p>
                  </>
                )}
                <input ref={fileInputRef} type="file" accept=".pdf,application/pdf,.jpg,.jpeg,.png,.webp,image/*" style={{ display:'none' }} onChange={e => handleFileChange(e.target.files[0])} />
              </div>

              <div style={{ display:'flex', justifyContent:'flex-end' }}>
                <button
                  style={{ ...s.btnPrimary, opacity: (!pdfFile || reportLoading) ? 0.5 : 1 }}
                  onClick={handleReportSubmit}
                  disabled={!pdfFile || reportLoading}
                  onMouseEnter={e => { if(pdfFile && !reportLoading) e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 25px rgba(99,102,241,0.5)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='' }}
                >
              {reportLoading ? (
                <>
                  <span style={{ animation:'spin 1s linear infinite', display:'inline-block' }}>⏳</span>
                  {' '}{pdfFile?.type?.startsWith('image/') ? 'Running OCR on image…' : 'Reading PDF & analyzing…'}
                </>
              ) : '🔍 Analyze Medical Report'}
                </button>
              </div>
            </div>

            {/* Loading */}
            {reportLoading && (
              <div style={s.card}>
                <Spinner text="AI is reading your medical report…" />
                <p style={{ color:'#475569', textAlign:'center', fontSize:'0.82rem', paddingBottom:'12px' }}>This may take a few seconds depending on report length</p>
              </div>
            )}

            {/* Error */}
            {reportError && (
              <div style={{ ...s.card, border:'1px solid rgba(239,68,68,0.25)', background:'rgba(239,68,68,0.06)' }}>
                {(reportError.includes('API key') || reportError.includes('GEMINI_API_KEY') || reportError.includes('not configured')) ? (
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'16px' }}>
                      <span style={{ fontSize:'1.8rem' }}>🔑</span>
                      <div>
                        <p style={{ color:'#fca5a5', fontWeight:800, fontSize:'1rem', marginBottom:'2px' }}>Gemini API Key Required</p>
                        <p style={{ color:'#94a3b8', fontSize:'0.82rem' }}>The PDF analyzer needs a free Google Gemini API key to work.</p>
                      </div>
                    </div>
                    <div style={{ background:'rgba(0,0,0,0.3)', borderRadius:'12px', padding:'16px', fontSize:'0.82rem', fontFamily:'monospace' }}>
                      <p style={{ color:'#64748b', marginBottom:'8px' }}>Step 1 — Get your free key:</p>
                      <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer"
                        style={{ color:'#818cf8', textDecoration:'underline', wordBreak:'break-all' }}>
                        https://aistudio.google.com/app/apikey
                      </a>
                      <p style={{ color:'#64748b', margin:'12px 0 8px' }}>Step 2 — Add to <code style={{color:'#a5b4fc'}}>backend/.env</code>:</p>
                      <p style={{ color:'#86efac' }}>GEMINI_API_KEY=<span style={{color:'#fcd34d'}}>your_actual_key_here</span></p>
                      <p style={{ color:'#64748b', marginTop:'12px' }}>Step 3 — Restart the backend server.</p>
                    </div>
                    <p style={{ color:'#475569', fontSize:'0.75rem', marginTop:'12px', textAlign:'center' }}>
                      💡 The Symptom Analyzer tab works without a key using smart keyword matching.
                    </p>
                  </div>
                ) : (
                  <div style={{ display:'flex', alignItems:'flex-start', gap:'12px' }}>
                    <span style={{ fontSize:'1.4rem', flexShrink:0 }}>⚠️</span>
                    <p style={{ color:'#fca5a5', lineHeight:'1.6', fontSize:'0.9rem' }}>{reportError}</p>
                  </div>
                )}
              </div>
            )}

            {/* Report Result */}
            {reportResult && !reportLoading && (
              <div style={s.card}>

                {/* Engine badge */}
                {reportResult.engine && (() => {
                  const ecfg = ENGINE_CONFIG[reportResult.engine]
                  return (
                    <div style={{ display:'flex', gap:'10px', alignItems:'center', marginBottom:'20px', flexWrap:'wrap' }}>
                      <span style={{ padding:'5px 14px', borderRadius:'999px', fontSize:'0.75rem', fontWeight:700,
                        background: ecfg?.bg, color: ecfg?.color, border:`1px solid ${ecfg?.border}` }}>
                        {ecfg?.icon} {ecfg?.label} &nbsp;·&nbsp; <span style={{ fontWeight:400, opacity:0.8 }}>{ecfg?.desc}</span>
                      </span>
                      {reportResult.extractionMethod && (
                        <span style={{ padding:'5px 12px', borderRadius:'999px', fontSize:'0.72rem', fontWeight:600,
                          background:'rgba(100,116,139,0.15)', color:'#94a3b8', border:'1px solid rgba(100,116,139,0.2)' }}>
                          {reportResult.extractionMethod === 'tesseract-ocr' ? '🔡 OCR extracted' : '📄 PDF text extracted'}
                        </span>
                      )}
                    </div>
                  )
                })()}}
                {(reportResult.seriousness === 'CRITICAL' || reportResult.seriousness === 'HIGH') && (
                  <div style={{
                    background: reportResult.seriousness === 'CRITICAL' ? 'rgba(239,68,68,0.15)' : 'rgba(249,115,22,0.12)',
                    border: `1px solid ${reportResult.seriousness === 'CRITICAL' ? 'rgba(239,68,68,0.5)' : 'rgba(249,115,22,0.4)'}`,
                    borderRadius:'14px', padding:'16px 20px', marginBottom:'24px',
                    display:'flex', gap:'14px', alignItems:'flex-start'
                  }}>
                    <span style={{ fontSize:'1.6rem', flexShrink:0 }}>{reportResult.seriousness === 'CRITICAL' ? '🚨' : '⚠️'}</span>
                    <div>
                      <p style={{ color: reportResult.seriousness === 'CRITICAL' ? '#fca5a5' : '#fdba74', fontWeight:800, fontSize:'0.95rem', marginBottom:'4px' }}>
                        {reportResult.seriousness === 'CRITICAL' ? 'EMERGENCY — Seek Immediate Medical Care' : 'Urgent Attention Required'}
                      </p>
                      <p style={{ color:'#94a3b8', fontSize:'0.85rem', lineHeight:'1.6' }}>{reportResult.emergencyAdvice}</p>
                    </div>
                  </div>
                )}

                {/* Severity + Specialty row */}
                <div style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap:'28px', alignItems:'center', marginBottom:'24px', paddingBottom:'24px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                  <SeverityGauge score={reportResult.seriousnessScore} level={reportResult.seriousness} />
                  <div>
                    <p style={{ color:'#94a3b8', fontSize:'0.75rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'8px' }}>Condition Seriousness</p>
                    <p style={{ color: SEVERITY_CONFIG[reportResult.seriousness]?.color || '#f1f5f9', fontWeight:800, fontSize:'1.5rem', marginBottom:'12px' }}>
                      {SEVERITY_CONFIG[reportResult.seriousness]?.label || reportResult.seriousness}
                    </p>
                    <p style={{ color:'#94a3b8', fontSize:'0.75rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'6px' }}>Recommended Specialist</p>
                    <p style={{ color:'#f1f5f9', fontWeight:700, fontSize:'1.1rem' }}>
                      {SPECIALITY_ICONS[reportResult.speciality] || '🏥'} {reportResult.speciality}
                    </p>
                    <p style={{ color:'#64748b', fontSize:'0.78rem', marginTop:'6px' }}>{SEVERITY_CONFIG[reportResult.seriousness]?.advice}</p>
                  </div>
                </div>

                {/* Summary */}
                <div style={{ ...s.resultCard, marginBottom:'16px' }}>
                  <p style={s.sectionTitle}>Report Summary</p>
                  <p style={{ color:'#cbd5e1', lineHeight:'1.7', fontSize:'0.92rem' }}>{reportResult.summary}</p>
                </div>

                {/* Lab Values Grid */}
                {reportResult.labValues && reportResult.labValues.length > 0 && (
                  <div style={{ ...s.resultCard, marginBottom:'16px', overflow:'hidden', padding:0 }}>
                    <div style={{ padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
                      <p style={{ ...s.sectionTitle, marginBottom:0 }}>🧪 Lab Values Analysis</p>
                      <p style={{ color:'#475569', fontSize:'0.72rem', marginTop:'4px' }}>
                        {reportResult.labValues.filter(v=>v.status==='NORMAL').length} Normal · &nbsp;
                        <span style={{color:'#fbbf24'}}>{reportResult.labValues.filter(v=>v.status==='LOW').length} Low</span> · &nbsp;
                        <span style={{color:'#ef4444'}}>{reportResult.labValues.filter(v=>v.status==='HIGH').length} High</span>
                      </p>
                    </div>
                    {/* Header */}
                    <div style={{
                      display:'grid', gridTemplateColumns:'1fr auto auto auto', gap:'8px',
                      padding:'8px 14px', background:'rgba(255,255,255,0.03)',
                      borderBottom:'1px solid rgba(255,255,255,0.07)'
                    }}>
                      {['Parameter','Value','Reference','Status'].map(h => (
                        <p key={h} style={{ color:'#475569', fontSize:'0.7rem', fontWeight:700,
                          textTransform:'uppercase', letterSpacing:'0.08em', margin:0,
                          textAlign: h==='Parameter' ? 'left' : 'right' }}>{h}</p>
                      ))}
                    </div>
                    {reportResult.labValues.map((lv, i) => <LabValueRow key={i} lv={lv} />)}
                  </div>
                )}

                {/* Key Findings */}
                {reportResult.keyFindings && reportResult.keyFindings.length > 0 && (
                  <div style={{ ...s.resultCard, marginBottom:'16px' }}>
                    <p style={s.sectionTitle}>Key Findings</p>
                    <ul style={{ margin:0, paddingLeft:'18px', display:'flex', flexDirection:'column', gap:'8px' }}>
                      {reportResult.keyFindings.map((f, i) => (
                        <li key={i} style={{ color:'#cbd5e1', fontSize:'0.9rem', lineHeight:'1.6' }}>{f}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Reasoning */}
                <div style={{ ...s.resultCard, marginBottom:'16px' }}>
                  <p style={s.sectionTitle}>Severity Assessment Reasoning</p>
                  <p style={{ color:'#94a3b8', lineHeight:'1.7', fontSize:'0.88rem' }}>{reportResult.reasoning}</p>
                </div>

                {/* Non-critical advice */}
                {reportResult.seriousness !== 'CRITICAL' && reportResult.seriousness !== 'HIGH' && (
                  <div style={{ background:'rgba(34,197,94,0.06)', border:'1px solid rgba(34,197,94,0.2)', borderRadius:'12px', padding:'14px 18px', marginBottom:'20px' }}>
                    <p style={{ color:'#86efac', fontSize:'0.85rem' }}>✅ {reportResult.emergencyAdvice}</p>
                  </div>
                )}

                {/* Disclaimer */}
                <div style={{ background:'rgba(99,102,241,0.06)', border:'1px solid rgba(99,102,241,0.15)', borderRadius:'10px', padding:'10px 16px', marginBottom:'24px' }}>
                  <p style={{ color:'#94a3b8', fontSize:'0.78rem' }}>⚕️ <strong style={{color:'#64748b'}}>Medical Disclaimer:</strong> This AI analysis is informational only and does not constitute a medical diagnosis. Please consult a licensed healthcare professional for proper evaluation and treatment.</p>
                </div>

                {/* Doctor cards */}
                {reportResult.doctors && reportResult.doctors.length > 0 && (
                  <>
                    <p style={s.sectionTitle}>Available {reportResult.speciality}s</p>
                    <div style={{ display:'grid', gap:'12px' }}>
                      {reportResult.doctors.map(doc => <DoctorCard key={doc._id} doc={doc} />)}
                    </div>
                  </>
                )}
                {reportResult.doctors && reportResult.doctors.length === 0 && (
                  <p style={{ color:'#64748b', textAlign:'center', padding:'20px 0' }}>No available doctors found for this specialty. <a href="/doctors" style={{ color:'#818cf8' }}>Browse all doctors</a>.</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default AIRecommendation
