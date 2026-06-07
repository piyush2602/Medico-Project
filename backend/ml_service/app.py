"""
app.py — Flask ML microservice for doctor specialty prediction.
Start:  python app.py
Port:   5001
"""

import os
import joblib
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# ─── Load model ───────────────────────────────────────────────────────────────
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model.pkl')
model = None

try:
    model = joblib.load(MODEL_PATH)
    print(f"[OK] ML model loaded -- classes: {model.classes_.tolist()}")
except FileNotFoundError:
    print("[ERR] model.pkl not found. Run 'python train.py' first.")

# ─── Specialty explanations ───────────────────────────────────────────────────
EXPLANATIONS = {
    'General physician': (
        "Based on your symptoms, a General Physician is the best starting point. "
        "They can assess your condition, run initial tests, and refer you to a specialist if needed."
    ),
    'Neurologist': (
        "Your symptoms suggest a neurological concern. A Neurologist specializes in brain, "
        "spinal cord, and nerve disorders and can provide an accurate diagnosis."
    ),
    'Dermatologist': (
        "Your symptoms indicate a skin-related condition. A Dermatologist specializes in "
        "diagnosing and treating all skin, hair, and nail conditions."
    ),
    'Gastroenterologist': (
        "Your symptoms point to a digestive system issue. A Gastroenterologist specializes "
        "in disorders of the stomach, intestines, liver, and bowel."
    ),
    'Gynecologist': (
        "Based on your symptoms, a Gynecologist is recommended. They specialize in women's "
        "reproductive health, menstrual disorders, and hormonal conditions."
    ),
    'Pediatricians': (
        "For a child's health concern, a Pediatrician is the right choice. They specialize "
        "in the medical care of infants, children, and adolescents."
    ),
    'Dentist': (
        "Your symptoms suggest a dental or oral health issue. A Dentist specializes in "
        "diagnosing and treating conditions related to teeth, gums, and the mouth."
    ),
    'Orthopedic': (
        "Your symptoms indicate a bone, joint, or musculoskeletal concern. An Orthopedic "
        "specialist treats conditions affecting bones, joints, ligaments, tendons, and muscles "
        "including hands, legs, spine, and sports injuries."
    ),
    'Cardiologist': (
        "Your symptoms suggest a heart or cardiovascular concern. A Cardiologist specializes "
        "in diagnosing and treating conditions of the heart, blood vessels, chest, and lungs."
    ),
}

# ─── Lab Reference Ranges (ML-based report analyzer) ─────────────────────────
# Format: 'parameter_key': {'range': (low, high), 'unit': 'unit_string'}
# or 'parameter_key': {'male': (low, high), 'female': (low, high), 'unit': '...'}
LAB_REFERENCE = {
    # Blood count
    'hemoglobin':    {'male': (13.5, 17.5), 'female': (12.0, 15.5), 'unit': 'g/dL'},
    'hgb':           {'male': (13.5, 17.5), 'female': (12.0, 15.5), 'unit': 'g/dL'},
    'hb':            {'male': (13.5, 17.5), 'female': (12.0, 15.5), 'unit': 'g/dL'},
    'wbc':           {'range': (4.0, 11.0),  'unit': '10^3/uL'},
    'rbc':           {'male': (4.5, 5.9),   'female': (4.0, 5.2),   'unit': '10^6/uL'},
    'platelets':     {'range': (150, 400),   'unit': '10^3/uL'},
    'hematocrit':    {'male': (41, 53),      'female': (36, 46),     'unit': '%'},
    'mcv':           {'range': (80, 100),    'unit': 'fL'},
    'mch':           {'range': (27, 33),     'unit': 'pg'},
    'mchc':          {'range': (32, 36),     'unit': 'g/dL'},
    # Blood sugar
    'glucose':       {'range': (70, 100),    'unit': 'mg/dL'},
    'blood sugar':   {'range': (70, 100),    'unit': 'mg/dL'},
    'fasting glucose': {'range': (70, 100),  'unit': 'mg/dL'},
    'hba1c':         {'range': (4.0, 5.6),   'unit': '%'},
    'a1c':           {'range': (4.0, 5.6),   'unit': '%'},
    # Kidney
    'creatinine':    {'male': (0.7, 1.2),    'female': (0.5, 1.0),   'unit': 'mg/dL'},
    'urea':          {'range': (7, 25),      'unit': 'mg/dL'},
    'bun':           {'range': (7, 25),      'unit': 'mg/dL'},
    'uric acid':     {'male': (3.5, 7.2),    'female': (2.6, 6.0),   'unit': 'mg/dL'},
    # Electrolytes
    'sodium':        {'range': (135, 145),   'unit': 'mEq/L'},
    'potassium':     {'range': (3.5, 5.0),   'unit': 'mEq/L'},
    'chloride':      {'range': (98, 107),    'unit': 'mEq/L'},
    'calcium':       {'range': (8.5, 10.5),  'unit': 'mg/dL'},
    'magnesium':     {'range': (1.7, 2.3),   'unit': 'mg/dL'},
    # Lipids
    'cholesterol':   {'range': (0, 200),     'unit': 'mg/dL'},
    'triglycerides': {'range': (0, 150),     'unit': 'mg/dL'},
    'hdl':           {'range': (40, 999),    'unit': 'mg/dL'},
    'ldl':           {'range': (0, 100),     'unit': 'mg/dL'},
    # Liver
    'alt':           {'range': (7, 56),      'unit': 'U/L'},
    'sgpt':          {'range': (7, 56),      'unit': 'U/L'},
    'ast':           {'range': (10, 40),     'unit': 'U/L'},
    'sgot':          {'range': (10, 40),     'unit': 'U/L'},
    'bilirubin':     {'range': (0.1, 1.2),   'unit': 'mg/dL'},
    'albumin':       {'range': (3.4, 5.4),   'unit': 'g/dL'},
    'alkaline phosphatase': {'range': (44, 147), 'unit': 'U/L'},
    'alp':           {'range': (44, 147),    'unit': 'U/L'},
    'ggt':           {'range': (0, 55),      'unit': 'U/L'},
    # Thyroid
    'tsh':           {'range': (0.4, 4.0),   'unit': 'mIU/L'},
    't4':            {'range': (0.8, 1.8),   'unit': 'ng/dL'},
    'free t4':       {'range': (0.8, 1.8),   'unit': 'ng/dL'},
    't3':            {'range': (80, 200),    'unit': 'ng/dL'},
    # Vitamins & Minerals
    'vitamin d':     {'range': (20, 50),     'unit': 'ng/mL'},
    'vitamin b12':   {'range': (200, 900),   'unit': 'pg/mL'},
    'folate':        {'range': (2.5, 999),   'unit': 'ng/mL'},
    'ferritin':      {'male': (12, 300),     'female': (12, 150),    'unit': 'ng/mL'},
    'iron':          {'male': (65, 175),     'female': (50, 170),    'unit': 'ug/dL'},
    'tibc':          {'range': (250, 370),   'unit': 'ug/dL'},
    # Cardiac
    'troponin':      {'range': (0, 0.04),    'unit': 'ng/mL'},
    'crp':           {'range': (0, 5),       'unit': 'mg/L'},
    'esr':           {'male': (0, 15),       'female': (0, 20),      'unit': 'mm/hr'},
}

import re

def extract_lab_values(text):
    """
    Extract lab parameter values from OCR/PDF text using regex.
    Matches patterns like:
      Hemoglobin: 11.2 g/dL
      GLUCOSE  95   mg/dL
      HbA1c     5.9%
    """
    results = []
    seen_params = set()

    # Pattern 1: "Param Name: value unit"  or  "Param Name - value unit"
    # Pattern 2: "Param Name  value  unit"  (space-separated, as in lab tables)
    patterns = [
        r'([A-Za-z][A-Za-z0-9\s\-\./]*?)\s*[:=\-]\s*(\d+\.?\d*)\s*([a-zA-Z%/\^\d\u00b5]+)?',
        r'^([A-Za-z][A-Za-z0-9\s\-\.]+?)\s{2,}(\d+\.?\d*)\s*([a-zA-Z%/\^\d\u00b5]+)?',
    ]

    for pattern in patterns:
        flags = re.IGNORECASE | re.MULTILINE
        for match in re.finditer(pattern, text, flags):
            param_raw = match.group(1).strip()
            value_str = match.group(2).strip()
            unit      = (match.group(3) or '').strip()

            # Skip noise
            if len(param_raw) < 2 or len(param_raw) > 45:
                continue
            try:
                value = float(value_str)
            except ValueError:
                continue

            # Lookup reference range
            param_lower = param_raw.lower().strip()
            ref_info = None
            for key in LAB_REFERENCE:
                if key == param_lower or key in param_lower or param_lower in key:
                    ref_info = LAB_REFERENCE[key]
                    break

            if not ref_info:
                continue

            # Determine range (default to male range for unisex display)
            ref_range = ref_info.get('range') or ref_info.get('male')
            if not ref_range:
                continue

            low, high = ref_range
            if value < low:
                status = 'LOW'
            elif value > high:
                status = 'HIGH'
            else:
                status = 'NORMAL'

            ref_str = f"{low}-{high}" if high < 999 else f">{low}"
            display_unit = unit or ref_info.get('unit', '')

            # Deduplicate by parameter key
            dedup_key = param_lower[:12]
            if dedup_key in seen_params:
                continue
            seen_params.add(dedup_key)

            results.append({
                'parameter':    param_raw,
                'value':        value_str,
                'unit':         display_unit,
                'referenceRange': ref_str,
                'status':       status
            })

    return results[:25]  # cap at 25 values


def score_seriousness(lab_values):
    """Estimate seriousness from lab value statuses."""
    if not lab_values:
        return 'MEDIUM', 50
    abnormal = [v for v in lab_values if v['status'] != 'NORMAL']
    ratio = len(abnormal) / len(lab_values)
    if ratio == 0:
        return 'LOW', 20
    elif ratio < 0.25:
        return 'LOW', 35
    elif ratio < 0.5:
        return 'MEDIUM', 55
    elif ratio < 0.75:
        return 'HIGH', 72
    else:
        return 'HIGH', 85


# ─── Keyword-priority classifier (runs BEFORE Naive Bayes) ───────────────────
# Ordered by specificity — multi-word phrases checked before single words
# Higher weight = longer phrase → beats a shorter generic match
KEYWORD_PRIORITY = [
    ('Dentist', [
        'tooth pain', 'teeth pain', 'toothache', 'dental abscess', 'wisdom tooth',
        'root canal', 'bleeding gum', 'swollen gum', 'gum disease', 'tooth decay',
        'tooth sensitivity', 'jaw pain tmj', 'chipped tooth', 'broken tooth',
        'mouth ulcer', 'bad breath', 'dental', 'cavity', 'cavities',
        'tooth', 'teeth', 'gum', 'gums', 'denture', 'braces', 'tartar',
    ]),
    ('Orthopedic', [
        'joint injury', 'knee pain', 'bone fracture', 'sports injury', 'slipped disc',
        'herniated disc', 'rotator cuff', 'acl tear', 'hip pain', 'back pain',
        'shoulder pain', 'wrist pain', 'ankle sprain', 'ankle pain', 'sciatica',
        'spinal', 'ligament tear', 'frozen shoulder', 'carpal tunnel', 'osteoporosis',
        'arthritis', 'rheumatoid', 'gout', 'fracture', 'broken bone', 'dislocation',
        'knee', 'bone', 'joint', 'spine', 'disc',
    ]),
    ('Cardiologist', [
        'chest pain', 'heart attack', 'shortness of breath', 'heart failure',
        'irregular heartbeat', 'heart palpitation', 'palpitation', 'palpitations',
        'chest tightness', 'chest pressure', 'angina', 'arrhythmia',
        'coronary', 'cardiac', 'pulmonary', 'breathlessness', 'ecg',
        'heart disease', 'tachycardia', 'bradycardia', 'lung pain', 'heart',
    ]),
    ('Neurologist', [
        'severe migraine', 'epileptic', 'seizure', 'epilepsy', 'stroke',
        'brain tumor', 'nerve pain', 'memory loss', 'paralysis', 'dementia',
        'multiple sclerosis', 'parkinson', 'meningitis', 'migraine', 'tremor',
        'brain', 'neuro',
    ]),
    ('Gastroenterologist', [
        'acid reflux', 'stomach pain', 'liver disease', 'irritable bowel',
        'ulcerative colitis', 'crohn', 'gallstone', 'peptic ulcer', 'heartburn',
        'bowel', 'constipation', 'ibs', 'liver', 'colon',
    ]),
    ('Gynecologist', [
        'irregular period', 'menstrual cramp', 'polycystic', 'pcos',
        'pregnancy', 'ovarian cyst', 'uterine fibroid', 'vaginal', 'menopause',
        'period', 'menstrual', 'ovary', 'uterus',
    ]),
    ('Dermatologist', [
        'skin rash', 'acne breakout', 'hair loss', 'skin lesion',
        'eczema', 'psoriasis', 'ringworm', 'rosacea', 'skin cancer',
        'skin', 'acne', 'rash',
    ]),
    ('Pediatricians', [
        'my child', 'my baby', 'infant', 'toddler', 'newborn',
        'child', 'baby', 'kid',
    ]),
    ('General physician', [
        'routine checkup', 'annual physical', 'general checkup',
        'flu', 'fever',
    ]),
]

def keyword_classify(symptoms):
    """
    Return (specialty, confidence) if a strong keyword match is found.
    Multi-word phrases score higher than single words.
    Returns (None, 0) if no match found.
    """
    lower = symptoms.lower()
    best_specialty = None
    best_score = 0

    for specialty, keywords in KEYWORD_PRIORITY:
        for kw in keywords:
            if kw in lower:
                # Longer phrases = stronger match
                score = len(kw.split()) * 10
                if score > best_score:
                    best_score = score
                    best_specialty = specialty

    if best_specialty:
        # Confidence: multi-word → 85-92%, single-word → 70-78%
        confidence = min(65 + best_score, 92)
        return best_specialty, confidence

    return None, 0


# ─── Routes ───────────────────────────────────────────────────────────────────
@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'model_loaded': model is not None,
        'classes': model.classes_.tolist() if model else []
    })


@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({
            'success': False,
            'message': 'ML model not loaded. Run train.py first.'
        }), 503

    data = request.get_json(silent=True)
    if not data or not data.get('symptoms', '').strip():
        return jsonify({'success': False, 'message': 'symptoms field is required'}), 400

    symptoms = data['symptoms'].strip()

    try:
        # ── Step 1: Try keyword-priority matching first ────────────────────────
        kw_specialty, kw_confidence = keyword_classify(symptoms)

        if kw_specialty:
            # Get NB probabilities to build alternatives
            probs = model.predict_proba([symptoms])[0]
            classes = model.classes_
            ranked = sorted(zip(classes, probs.tolist()), key=lambda x: x[1], reverse=True)

            alternatives = [
                {'speciality': s, 'confidence': round(p * 100)}
                for s, p in ranked[:4]
                if s != kw_specialty and round(p * 100) > 5
            ][:3]

            return jsonify({
                'success': True,
                'speciality': kw_specialty,
                'confidence': kw_confidence,
                'explanation': EXPLANATIONS.get(kw_specialty, ''),
                'alternatives': alternatives,
                'engine': 'ml'
            })

        # ── Step 2: Fallback to Naive Bayes model ─────────────────────────────
        probs = model.predict_proba([symptoms])[0]
        classes = model.classes_

        ranked = sorted(zip(classes, probs.tolist()), key=lambda x: x[1], reverse=True)

        top_speciality = ranked[0][0]
        top_confidence = round(ranked[0][1] * 100)

        alternatives = [
            {'speciality': s, 'confidence': round(p * 100)}
            for s, p in ranked[1:4]
            if round(p * 100) > 5
        ]

        return jsonify({
            'success': True,
            'speciality': top_speciality,
            'confidence': max(top_confidence, 50),
            'explanation': EXPLANATIONS.get(top_speciality, ''),
            'alternatives': alternatives,
            'engine': 'ml'
        })

    except Exception as e:
        print(f"Prediction error: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/analyze-report', methods=['POST'])
def analyze_report():
    """
    ML-based medical report analyzer.
    Accepts: { "text": "<extracted OCR/PDF text>" }
    Returns: lab values with LOW/NORMAL/HIGH, specialty, seriousness
    """
    data = request.get_json(silent=True)
    if not data or not data.get('text', '').strip():
        return jsonify({'success': False, 'message': 'text field is required'}), 400

    text = data['text'].strip()

    try:
        # 1. Extract individual lab values using regex + reference dict
        lab_values = extract_lab_values(text)

        # 2. Estimate seriousness from abnormal values
        seriousness, seriousness_score = score_seriousness(lab_values)

        # 3. Determine specialty from text using keyword + NB model
        kw_specialty, kw_confidence = keyword_classify(text)
        if kw_specialty:
            speciality   = kw_specialty
            confidence   = kw_confidence
        elif model:
            probs        = model.predict_proba([text])[0]
            classes      = model.classes_
            ranked       = sorted(zip(classes, probs.tolist()), key=lambda x: x[1], reverse=True)
            speciality   = ranked[0][0]
            confidence   = max(round(ranked[0][1] * 100), 50)
        else:
            speciality   = 'General physician'
            confidence   = 50

        # 4. Build key findings list from abnormal values
        key_findings = []
        for lv in lab_values:
            if lv['status'] != 'NORMAL':
                arrow = 'below' if lv['status'] == 'LOW' else 'above'
                key_findings.append(
                    f"{lv['parameter']} is {lv['status']} ({lv['value']} {lv['unit']} — "
                    f"normal: {lv['referenceRange']})"
                )

        # 5. Generate summary
        abnormal_count = len([v for v in lab_values if v['status'] != 'NORMAL'])
        total = len(lab_values)
        if total == 0:
            summary = ("No recognizable lab parameters were found in the extracted text. "
                       "The report may need clearer OCR or contain non-standard formatting.")
        elif abnormal_count == 0:
            summary = (f"All {total} detected lab parameters are within normal reference ranges. "
                       "Overall results appear normal. Continue routine health monitoring.")
        else:
            summary = (f"Out of {total} detected parameters, {abnormal_count} value(s) fall "
                       f"outside normal reference ranges. A {speciality} review is recommended "
                       f"to evaluate these findings further.")

        # 6. Emergency advice
        if seriousness == 'CRITICAL':
            advice = "Seek emergency care immediately. Multiple critical values detected."
        elif seriousness == 'HIGH':
            advice = "Consult your doctor within 24-48 hours. Several abnormal values require prompt attention."
        elif seriousness == 'MEDIUM':
            advice = "Schedule an appointment with your doctor within the next few days to review these results."
        else:
            advice = "No urgent action required. Schedule a routine follow-up at your convenience."

        return jsonify({
            'success':        True,
            'speciality':     speciality,
            'confidence':     confidence,
            'explanation':    EXPLANATIONS.get(speciality, ''),
            'seriousness':    seriousness,
            'seriousnessScore': seriousness_score,
            'labValues':      lab_values,
            'keyFindings':    key_findings,
            'summary':        summary,
            'reasoning':      f"ML analysis detected {abnormal_count}/{total} abnormal lab values. Seriousness estimated at {seriousness} level.",
            'emergencyAdvice': advice,
            'engine':         'ml'
        })

    except Exception as e:
        print(f"analyze-report error: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500


if __name__ == '__main__':
    port = int(os.environ.get('ML_PORT', 5001))
    print(f"[ML] service running on http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=False)
