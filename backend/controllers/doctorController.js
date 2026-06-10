import doctorModel from "../models/doctorModel.js"
import appointmentModel from "../models/appointmentModel.js"
import { GoogleGenerativeAI } from "@google/generative-ai"
import http from "http"
import https from "https"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import {v2 as cloudinary} from 'cloudinary'
import chatModel from "../models/chatModel.js"
import userModel from "../models/userModel.js"
import { sendAppointmentCancellation, sendDoctorCustomEmail } from "../config/notifier.js"

// ─── ML service call ─────────────────────────────────────────────────────────
const callMLService = (symptoms) => {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({ symptoms })
        const mlUrl = process.env.ML_SERVICE_URL || 'https://medico-project-o7vv.onrender.com'
        const parsedUrl = new URL(mlUrl)
        
        const options = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
            path: '/predict',
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
            timeout: 5000
        }
        const requestModule = parsedUrl.protocol === 'https:' ? https : http;
        const req = requestModule.request(options, (res) => {
            let data = ''
            res.on('data', chunk => data += chunk)
            res.on('end', () => {
                try { resolve(JSON.parse(data)) }
                catch { reject(new Error('Invalid ML response')) }
            })
        })
        req.on('error', reject)
        req.on('timeout', () => { req.destroy(); reject(new Error('ML service timeout')) })
        req.write(body)
        req.end()
    })
}

const VALID_SPECIALITIES = [
    'General physician',
    'Gynecologist',
    'Dermatologist',
    'Pediatricians',
    'Neurologist',
    'Gastroenterologist',
    'Dentist',
    'Orthopedic',
    'Cardiologist'
]

// ─── Keyword fallback engine ─────────────────────────────────────────────────
const SYMPTOM_MAP = [
    {
        speciality: 'Neurologist',
        keywords: ['headache', 'migraine', 'seizure', 'epilepsy', 'dizziness', 'vertigo', 'numbness', 'tingling', 'tremor', 'stroke', 'memory', 'confusion', 'fainting', 'paralysis', 'brain', 'nerve', 'neuro', 'ms', 'multiple sclerosis']
    },
    {
        speciality: 'Dermatologist',
        keywords: ['rash', 'skin', 'acne', 'eczema', 'psoriasis', 'itching', 'hives', 'wart', 'mole', 'blister', 'dry skin', 'oily skin', 'hair loss', 'nail', 'fungal', 'ringworm', 'dermatitis', 'allergy skin']
    },
    {
        speciality: 'Gastroenterologist',
        keywords: ['stomach', 'abdomen', 'abdominal', 'nausea', 'vomiting', 'diarrhea', 'constipation', 'bloating', 'gas', 'acid', 'reflux', 'heartburn', 'indigestion', 'ulcer', 'liver', 'ibs', 'crohn', 'colitis', 'jaundice', 'bowel', 'colon', 'rectal', 'hemorrhoid', 'gallstone', 'pancreas']
    },
    {
        speciality: 'Gynecologist',
        keywords: ['period', 'menstrual', 'menstruation', 'pregnancy', 'pregnant', 'ovary', 'uterus', 'vaginal', 'pcos', 'endometriosis', 'fertility', 'contraception', 'cervical', 'breast pain', 'menopause', 'pap smear', 'female', 'gynaecological']
    },
    {
        speciality: 'Pediatricians',
        keywords: ['child', 'baby', 'infant', 'toddler', 'kid', 'newborn', 'pediatric', 'vaccination', 'growth', 'development', 'childhood', 'juvenile']
    },
    {
        speciality: 'General physician',
        keywords: ['fever', 'cold', 'cough', 'flu', 'fatigue', 'weakness', 'tired', 'infection', 'diabetes', 'hypertension', 'blood pressure', 'cholesterol', 'thyroid', 'weight', 'general', 'check up', 'checkup', 'routine']
    },
    {
        speciality: 'Dentist',
        keywords: ['tooth', 'teeth', 'dental', 'gum', 'gums', 'cavity', 'cavities', 'toothache', 'jaw', 'mouth pain', 'crown', 'braces', 'wisdom tooth', 'root canal', 'sensitivity teeth', 'bleeding gums', 'plaque', 'tartar', 'bad breath', 'halitosis', 'chipped tooth', 'broken tooth', 'loose tooth', 'denture', 'orthodontic', 'tooth extraction', 'swollen gum']
    },
    {
        speciality: 'Orthopedic',
        keywords: ['bone', 'fracture', 'broken bone', 'joint', 'knee pain', 'hip pain', 'shoulder pain', 'elbow', 'wrist pain', 'ankle', 'foot pain', 'back pain', 'spine', 'spinal', 'disc', 'ligament', 'tendon', 'muscle tear', 'sports injury', 'arthritis', 'osteoporosis', 'hand pain', 'leg pain', 'arm pain', 'neck pain', 'scoliosis', 'swollen joint', 'stiff joint', 'carpal tunnel', 'rotator cuff', 'acl', 'meniscus', 'dislocation', 'sprain', 'strain']
    },
    {
        speciality: 'Cardiologist',
        keywords: ['chest pain', 'heart', 'cardiac', 'palpitation', 'shortness of breath', 'breathlessness', 'chest tightness', 'chest pressure', 'heart attack', 'angina', 'arrhythmia', 'irregular heartbeat', 'heart failure', 'blood pressure high', 'hypertension severe', 'cholesterol high', 'coronary', 'ecg', 'ekg', 'stent', 'bypass', 'valve', 'aorta', 'pulmonary', 'lung pain', 'lung disease', 'copd', 'heart rate', 'tachycardia', 'bradycardia', 'edema legs heart', 'swollen ankles heart']
    }
]

const keywordFallback = (symptoms) => {
    const lowerSymptoms = symptoms.toLowerCase()
    const scores = SYMPTOM_MAP.map(entry => ({
        speciality: entry.speciality,
        score: entry.keywords.filter(kw => lowerSymptoms.includes(kw)).length
    }))
    scores.sort((a, b) => b.score - a.score)
    const best = scores[0]
    return {
        speciality: best.score > 0 ? best.speciality : 'General physician',
        explanation: best.score > 0
            ? `Based on the keywords in your symptoms, a ${best.speciality} would be most appropriate to address your concerns.`
            : 'Based on your symptoms, we recommend starting with a General Physician for an initial evaluation.',
        confidence: best.score > 0 ? Math.min(60 + best.score * 8, 92) : 50
    }
}

// ─── Change doctor availability ───────────────────────────────────────────────
const changeAvailability = async (req, res) => {
    try {
        const { docId } = req.body
        const docData = await doctorModel.findById(docId)
        await doctorModel.findByIdAndUpdate(docId, { available: !docData.available })
        res.json({ success: true, message: 'Availability changed' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// ─── Get all doctors ──────────────────────────────────────────────────────────
const doctorList = async (req, res) => {
    try {
        const doctors = await doctorModel.find({}).select(['-password', '-email'])
        res.json({ success: true, doctors })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// ─── AI Symptom → Doctor Recommendation ──────────────────────────────────────
const recommendDoctor = async (req, res) => {
    try {
        const { symptoms } = req.body
        if (!symptoms || symptoms.trim().length < 3) {
            return res.json({ success: false, message: 'Please describe your symptoms.' })
        }

        let recommendation = null
        let engine = 'keyword' // track which layer produced the result
        let mlAlternatives = []

        // ── Layer 1: Gemini AI ────────────────────────────────────────────────
        if (process.env.GEMINI_API_KEY) {
            try {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
                const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

                const prompt = `You are a medical triage assistant. A patient describes their symptoms below. Based on the symptoms, recommend exactly ONE doctor specialty from this list: ${VALID_SPECIALITIES.join(', ')}.

Patient Symptoms: "${symptoms}"

Respond ONLY with valid JSON in this exact format (no markdown, no code block):
{
  "speciality": "<one of the valid specialties>",
  "explanation": "<2-3 sentence patient-friendly explanation of why this specialty is recommended>",
  "confidence": <integer 0-100>
}`

                const result = await model.generateContent(prompt)
                const text = result.response.text().trim()
                const jsonMatch = text.match(/\{[\s\S]*\}/)
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0])
                    if (VALID_SPECIALITIES.includes(parsed.speciality)) {
                        recommendation = parsed
                        engine = 'gemini'
                    }
                }
            } catch (geminiError) {
                console.log('Gemini API error, trying ML service:', geminiError.message)
            }
        }

        // ── Layer 2: ML Model ─────────────────────────────────────────────────
        if (!recommendation) {
            try {
                const mlResult = await callMLService(symptoms)
                if (mlResult.success && VALID_SPECIALITIES.includes(mlResult.speciality)) {
                    recommendation = {
                        speciality: mlResult.speciality,
                        explanation: mlResult.explanation,
                        confidence: mlResult.confidence
                    }
                    engine = 'ml'
                    mlAlternatives = mlResult.alternatives || []
                    console.log(`ML model predicted: ${mlResult.speciality} (${mlResult.confidence}%)`)
                }
            } catch (mlError) {
                console.log('ML service unavailable, using keyword fallback:', mlError.message)
            }
        }

        // ── Layer 3: Keyword Fallback ─────────────────────────────────────────
        if (!recommendation) {
            recommendation = keywordFallback(symptoms)
            engine = 'keyword'
        }

        // Fetch matching doctors (available or not)
        const doctors = await doctorModel
            .find({ speciality: recommendation.speciality })
            .select(['-password', '-email'])
            .limit(6)

        res.json({
            success: true,
            speciality: recommendation.speciality,
            explanation: recommendation.explanation,
            confidence: recommendation.confidence,
            engine,                          // 'gemini' | 'ml' | 'keyword'
            aiPowered: engine === 'gemini',
            mlAlternatives,                  // top-3 runner-up specialties from ML
            doctors
        })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// ─── Helper: call ML /analyze-report with extracted text ─────────────────────
const callMLReportAnalyzer = (text) => {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({ text: text.substring(0, 6000) })
        const mlUrl = process.env.ML_SERVICE_URL || 'https://medico-project-o7vv.onrender.com'
        const parsedUrl = new URL(mlUrl)
        
        const options = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
            path: '/analyze-report',
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
            timeout: 8000
        }
        const requestModule = parsedUrl.protocol === 'https:' ? https : http;
        const req = requestModule.request(options, (res) => {
            let data = ''
            res.on('data', chunk => data += chunk)
            res.on('end', () => {
                try { resolve(JSON.parse(data)) }
                catch { reject(new Error('Invalid ML response')) }
            })
        })
        req.on('error', reject)
        req.on('timeout', () => { req.destroy(); reject(new Error('ML service timeout')) })
        req.write(body)
        req.end()
    })
}

// ─── PDF / Image Report → Lab Values + Severity + Doctor Recommendation ────────
const analyzeReport = async (req, res) => {
    try {
        if (!req.file) {
            return res.json({ success: false, message: 'Please upload a PDF or image (JPG, PNG) medical report.' })
        }

        const isImage = req.file.mimetype.startsWith('image/')
        const isPDF   = req.file.mimetype === 'application/pdf'

        // ── STEP 1: Extract text from file (OCR for images, pdf-parse for PDFs) ──
        let extractedText = ''
        let extractionMethod = 'none'

        if (isPDF) {
            try {
                const { createRequire } = await import('module')
                const require = createRequire(import.meta.url)
                const pdfParseRaw = require('pdf-parse')
                const pdfParse = pdfParseRaw.default || pdfParseRaw
                const pdfData = await pdfParse(req.file.buffer)
                extractedText = pdfData.text?.trim() || ''
                if (extractedText.length >= 30) extractionMethod = 'pdf-parse'
                console.log(`PDF text extracted: ${extractedText.length} chars`)
            } catch (e) {
                console.log('pdf-parse failed:', e.message?.substring(0, 80))
            }
        }

        if (isImage) {
            try {
                const { createWorker } = await import('tesseract.js')
                const worker = await createWorker('eng', 1, { logger: () => {} })
                const { data: { text } } = await worker.recognize(req.file.buffer)
                await worker.terminate()
                if (text?.trim().length > 20) {
                    extractedText = text.trim()
                    extractionMethod = 'tesseract-ocr'
                    console.log(`OCR extracted: ${extractedText.length} chars`)
                }
            } catch (ocrErr) {
                console.log('Tesseract OCR error:', ocrErr.message?.substring(0, 80))
            }
        }

        // Build Gemini prompt with updated schema requesting labValues
        const buildPrompt = (content) => `You are a senior medical AI assistant analyzing a patient lab report.

Valid doctor specialties: ${VALID_SPECIALITIES.join(', ')}
Seriousness levels: LOW (routine), MEDIUM (needs attention), HIGH (urgent, 24-48h), CRITICAL (emergency)

${content}

Respond ONLY with valid JSON (no markdown, no code fences):
{
  "speciality": "<one of the valid specialties>",
  "seriousness": "<LOW|MEDIUM|HIGH|CRITICAL>",
  "seriousnessScore": <integer 0-100>,
  "summary": "<2-3 sentence plain-English summary>",
  "keyFindings": ["<finding 1>", "<finding 2>", "<finding 3>"],
  "labValues": [
    {"parameter": "<name>", "value": "<numeric>", "unit": "<unit>", "referenceRange": "<low-high>", "status": "<LOW|NORMAL|HIGH>"},
    ...
  ],
  "reasoning": "<2-3 sentences why this seriousness level>",
  "emergencyAdvice": "<what the patient should do next>",
  "confidence": <integer 0-100>
}`

        // ── STEP 2: Layer 1 — Try Gemini AI ──────────────────────────────────────
        let analysis = null
        let engine = 'ml'

        const geminiKey = process.env.GEMINI_API_KEY?.trim()
        const geminiValid = geminiKey && geminiKey.length > 20 && !geminiKey.startsWith('your_')

        if (geminiValid) {
            try {
                const genAI = new GoogleGenerativeAI(geminiKey)
                const gModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

                let geminiContents
                if (extractedText.length >= 50) {
                    geminiContents = buildPrompt(`Medical Report Text:\n---\n${extractedText.substring(0, 8000)}\n---`)
                } else if (isPDF) {
                    // Scanned PDF — send base64 inline
                    const pdfBase64 = req.file.buffer.toString('base64')
                    geminiContents = [
                        buildPrompt('The attached PDF is the medical report. Read all content.'),
                        { inlineData: { mimeType: 'application/pdf', data: pdfBase64 } }
                    ]
                } else if (isImage) {
                    // Send image inline for Gemini Vision
                    const imgBase64 = req.file.buffer.toString('base64')
                    geminiContents = [
                        buildPrompt('The attached image is the medical lab report. Extract and analyze all visible values.'),
                        { inlineData: { mimeType: req.file.mimetype, data: imgBase64 } }
                    ]
                }

                if (geminiContents) {
                    // Retry with backoff
                    for (let attempt = 1; attempt <= 3; attempt++) {
                        try {
                            const result = await gModel.generateContent(geminiContents)
                            const rawText = result.response.text().trim()
                            const jsonMatch = rawText.match(/\{[\s\S]*\}/)
                            if (jsonMatch) {
                                analysis = JSON.parse(jsonMatch[0])
                                engine = 'gemini'
                                console.log(`Gemini analyzed report: ${analysis.seriousness}`)
                                break
                            }
                        } catch (err) {
                            const isRate = err?.status === 429 || (err?.message || '').includes('429')
                            if (isRate && attempt < 3) {
                                await new Promise(r => setTimeout(r, attempt * 8000))
                                continue
                            }
                            throw err
                        }
                    }
                }
            } catch (geminiErr) {
                console.log('Gemini report analysis failed:', geminiErr?.status, geminiErr?.message?.substring(0, 80))
            }
        }

        // ── STEP 3: Layer 2 — ML Service /analyze-report ─────────────────────────
        if (!analysis && extractedText.length >= 20) {
            try {
                const mlResult = await callMLReportAnalyzer(extractedText)
                if (mlResult.success) {
                    analysis = mlResult
                    engine = 'ml'
                    console.log(`ML analyzed report: ${mlResult.seriousness}, ${mlResult.speciality}`)
                }
            } catch (mlErr) {
                console.log('ML report service unavailable:', mlErr.message)
            }
        }

        // ── STEP 4: Layer 3 — Keyword fallback for specialty only ─────────────────
        if (!analysis) {
            const kw = keywordFallback(extractedText || req.file.originalname || 'general report')
            analysis = {
                speciality: kw.speciality,
                seriousness: 'MEDIUM',
                seriousnessScore: 50,
                summary: extractedText.length < 20
                    ? 'Could not extract readable text from this file. Please ensure it is a clear, text-based PDF or a well-lit image.'
                    : 'Report analyzed using keyword matching. Please consult a doctor for a proper evaluation.',
                keyFindings: [],
                labValues: [],
                reasoning: 'Keyword-based analysis used as primary AI services were unavailable.',
                emergencyAdvice: 'Please consult a qualified medical professional for accurate interpretation.',
                confidence: 40
            }
            engine = 'keyword'
        }

        // Sanitize
        if (!VALID_SPECIALITIES.includes(analysis.speciality)) analysis.speciality = 'General physician'
        if (!['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(analysis.seriousness)) analysis.seriousness = 'MEDIUM'
        analysis.seriousnessScore = Math.max(0, Math.min(100, Number(analysis.seriousnessScore) || 50))
        if (!Array.isArray(analysis.keyFindings)) analysis.keyFindings = []
        if (!Array.isArray(analysis.labValues)) analysis.labValues = []

        // Fetch matching doctors
        const doctors = await doctorModel
            .find({ speciality: analysis.speciality })
            .select(['-password', '-email'])
            .limit(6)

        res.json({
            success: true,
            engine,
            fileType: isImage ? 'image' : 'pdf',
            extractionMethod,
            speciality:      analysis.speciality,
            seriousness:     analysis.seriousness,
            seriousnessScore: analysis.seriousnessScore,
            summary:         analysis.summary,
            keyFindings:     analysis.keyFindings,
            labValues:       analysis.labValues,
            reasoning:       analysis.reasoning,
            emergencyAdvice: analysis.emergencyAdvice,
            confidence:      analysis.confidence,
            doctors
        })
    } catch (error) {
        console.log('analyzeReport error:', error?.status, error?.message?.substring(0, 120))
        res.json({ success: false, message: error.message || 'Report analysis failed. Please try again.' })
    }
}

// new doctor functions defined below — export at bottom of file

// ─── Doctor Login ──────────────────────────────────────────────────────────────
const loginDoctor = async (req, res) => {
    try {
        const { email, password } = req.body
        const doctor = await doctorModel.findOne({ email })

        if (!doctor) {
            return res.json({ success: false, message: 'Doctor not found' })
        }

        const isMatch = await bcrypt.compare(password, doctor.password)

        if (!isMatch) {
            return res.json({ success: false, message: 'Invalid credentials' })
        }

        const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET)
        res.json({ success: true, token })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// ─── Get Doctor's Own Appointments ────────────────────────────────────────────
const getDocAppointments = async (req, res) => {
    try {
        const { docId } = req.body
        const appointments = await appointmentModel.find({ docId })
        res.json({ success: true, appointments: appointments.reverse() })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// ─── Doctor Cancel Appointment ────────────────────────────────────────────────
const docCancelAppointment = async (req, res) => {
    try {
        const { docId, appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData || appointmentData.docId !== docId) {
            return res.json({ success: false, message: 'Unauthorized action' })
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

        // Release the doctor slot
        const { slotDate, slotTime } = appointmentData
        const doctorData = await doctorModel.findById(docId)
        let slots_booked = doctorData.slots_booked
        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)
        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        const userData = await userModel.findById(appointmentData.userId)
        sendAppointmentCancellation(userData.email, doctorData.email, userData.name, doctorData.name, slotDate, slotTime, doctorData.name);

        res.json({ success: true, message: 'Appointment cancelled' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// ─── Doctor Complete Appointment ──────────────────────────────────────────────
const docCompleteAppointment = async (req, res) => {
    try {
        const { docId, appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData || appointmentData.docId !== docId) {
            return res.json({ success: false, message: 'Unauthorized action' })
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true })
        res.json({ success: true, message: 'Appointment completed' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// ─── Save Prescription ────────────────────────────────────────────────────────
const savePrescription = async (req, res) => {
    try {
        const { docId, appointmentId, prescription } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData || appointmentData.docId !== docId) {
            return res.json({ success: false, message: 'Unauthorized action' })
        }

        prescription.createdAt = new Date().toISOString()
        await appointmentModel.findByIdAndUpdate(appointmentId, { prescription })
        res.json({ success: true, message: 'Prescription saved successfully' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// ─── Get Doctor Profile ───────────────────────────────────────────────────────
const getDocProfile = async (req, res) => {
    try {
        const { docId } = req.body
        const doctor = await doctorModel.findById(docId).select('-password')
        res.json({ success: true, docData: doctor })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// ─── Get Doctor Chat History ──────────────────────────────────────────────────
const getDocChatHistory = async (req, res) => {
    try {
        const { appointmentId, docId } = req.body;
        // Verify doctor owns the appointment
        const appointmentData = await appointmentModel.findById(appointmentId);
        if (!appointmentData || appointmentData.docId !== docId) {
            return res.json({ success: false, message: 'Unauthorized action' });
        }
        const messages = await chatModel.find({ appointmentId }).sort({ timestamp: 1 });
        res.json({ success: true, messages });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// ─── Upload Doctor Chat Attachment ────────────────────────────────────────────
const uploadDocChatAttachment = async (req, res) => {
    try {
        const imageFile = req.file;
        const { appointmentId, docId } = req.body;
        
        // Verify doctor owns the appointment
        const appointmentData = await appointmentModel.findById(appointmentId);
        if (!appointmentData || appointmentData.docId !== docId) {
            return res.json({ success: false, message: 'Unauthorized action' });
        }

        if (!imageFile) {
            return res.json({ success: false, message: "No file provided" });
        }
        
        const isPdf = imageFile.mimetype === 'application/pdf';
        const fileUpload = await cloudinary.uploader.upload(imageFile.path, { 
            resource_type: isPdf ? "raw" : "auto" 
        });
        
        res.json({ 
            success: true, 
            attachment: {
                url: fileUpload.secure_url,
                type: isPdf ? 'pdf' : 'image'
            }
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// ─── Erase Chat History ───────────────────────────────────────────────────────
const eraseChatHistory = async (req, res) => {
    try {
        const { appointmentId, docId } = req.body;
        
        // Verify doctor owns the appointment
        const appointmentData = await appointmentModel.findById(appointmentId);
        if (!appointmentData || appointmentData.docId !== docId) {
            return res.json({ success: false, message: 'Unauthorized action' });
        }

        await chatModel.deleteMany({ appointmentId });
        res.json({ success: true, message: 'Chat erased successfully' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// ─── Send Custom Email to Patient ──────────────────────────────────────────
const sendCustomEmail = async (req, res) => {
    try {
        const { docId, appointmentId, subject, message } = req.body;
        
        if (!subject || !message) {
            return res.json({ success: false, message: 'Subject and message are required' });
        }

        // Verify doctor owns the appointment
        const appointmentData = await appointmentModel.findById(appointmentId);
        if (!appointmentData || appointmentData.docId !== docId) {
            return res.json({ success: false, message: 'Unauthorized action' });
        }

        const userData = await userModel.findById(appointmentData.userId);
        const doctorData = await doctorModel.findById(docId);

        if (!userData) {
            return res.json({ success: false, message: 'Patient not found' });
        }

        const emailSent = await sendDoctorCustomEmail(userData.email, userData.name, doctorData.name, subject, message);

        if (emailSent) {
            res.json({ success: true, message: 'Email sent successfully' });
        } else {
            res.json({ success: false, message: 'Failed to send email. Check server logs.' });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { changeAvailability, doctorList, recommendDoctor, analyzeReport, loginDoctor, getDocAppointments, docCancelAppointment, docCompleteAppointment, savePrescription, getDocProfile, getDocChatHistory, uploadDocChatAttachment, eraseChatHistory, sendCustomEmail }
