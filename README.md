<div align="center">

# 🏥 Medico - Healthcare Appointment System

### A full-stack MERN application for booking doctor appointments with an admin panel for hospital management

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Frontend-blue?style=for-the-badge&logo=vercel)](https://medico-frontend-qqf6.onrender.com)
[![Admin Panel](https://img.shields.io/badge/Admin%20Panel-Dashboard-green?style=for-the-badge&logo=shield)](https://medico-admin-zpnw.onrender.com)
[![Backend API](https://img.shields.io/badge/Backend-API-orange?style=for-the-badge&logo=node.js)](https://medico-backend-1-lzd2.onrender.com)

![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

</div>

---

### 🏠 Homepage
![Medico Homepage](C:/Users/piyus/.gemini/antigravity/brain/bba88823-cbc7-4498-bd3f-40829101b507/medico_homepage_screenshot_1765047966469.png)

---

## ✨ Features

### 👨‍⚕️ **For Patients**
- 🔍 Browse and search for doctors by specialty
- 📅 Book appointments with available doctors
- 👤 User authentication (Sign up / Login)
- 📱 Responsive design for mobile and desktop
- 💼 Manage appointments and profile

### 🛡️ **For Admins**
- 📊 Dashboard with analytics
- ➕ Add, edit, and delete doctors
- 📋 Manage all appointments
- ✅ Toggle doctor availability
- 📈 View statistics and insights

### 🤖 **AI & Machine Learning Integration**
- **AI Symptom Checker:** Users can type their symptoms to get an instant AI-powered recommendation for the right medical specialist. Powered by **Google Gemini 2.0 Flash**.
- **Medical Report Analyzer:** Users can upload lab reports (PDF, JPG, PNG) for automated analysis.
  - Features **Tesseract.js OCR** for image-based reports and **pdf-parse** for PDFs.
  - Automatically extracts lab values and highlights `LOW`, `NORMAL`, and `HIGH` parameters with color-coded UI indicators.
- **Robust 3-Layer Fallback Architecture:** Ensures AI features are always available.
  - *Layer 1:* Primary analysis via Google Gemini API.
  - *Layer 2:* Custom Python Flask ML Microservice (uses **Naive Bayes** and regex extraction) for offline/fallback analysis.
  - *Layer 3:* Local Keyword-Priority heuristic fallback.

---

## 🚀 Live Deployment

| Service | URL | Status |
|---------|-----|--------|
| **Frontend** | [medico-frontend-qqf6.onrender.com](https://medico-frontend-qqf6.onrender.com) | ✅ Live |
| **Admin Panel** | [medico-admin-zpnw.onrender.com](https://medico-admin-zpnw.onrender.com) | ✅ Live |
| **Backend API** | [medico-backend-1-lzd2.onrender.com](https://medico-backend-1-lzd2.onrender.com) | ✅ Live |

---

## 🛠️ Tech Stack

### Frontend
- **React** - UI Library
- **Vite** - Build tool
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **React Toastify** - Notifications

### Backend & ML Service
- **Node.js & Express.js** - Main API server
- **Python & Flask** - ML Microservice
- **MongoDB & Mongoose** - Database & ODM
- **Google Gemini API** - LLM-powered report & symptom analysis
- **Tesseract.js** - Image OCR for medical reports
- **Scikit-learn** - Naive Bayes ML model for text classification
- **JWT & Bcrypt** - Authentication & Security
- **Multer & Cloudinary** - File uploads & Storage

---

## 📦 Project Structure

```
Medico/
├── frontend/          # Patient-facing React app
├── admin/             # Admin panel React app
├── backend/           # Express.js API server
├── DEPLOYMENT.md      # Deployment guide
└── README.md          # This file
```

---



## 📝 API Endpoints

### User Routes
- `POST /api/user/register` - Register new user
- `POST /api/user/login` - User login
- `GET /api/user/get-profile` - Get user profile
- `POST /api/user/update-profile` - Update user profile
- `POST /api/user/book-appointment` - Book appointment
- `GET /api/user/appointments` - Get user appointments
- `POST /api/user/cancel-appointment` - Cancel appointment

### Admin Routes
- `POST /api/admin/login` - Admin login
- `POST /api/admin/add-doctor` - Add new doctor
- `GET /api/admin/all-doctors` - Get all doctors
- `POST /api/admin/change-availability` - Toggle doctor availability
- `GET /api/admin/appointments` - Get all appointments
- `POST /api/admin/cancel-appointment` - Cancel appointment
- `GET /api/admin/dashboard` - Get dashboard data

### Doctor Routes
- `GET /api/doctor/list` - Get all available doctors

---

## 🌐 Deployment

This project is deployed on **Render**. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Deploy Your Own Instance

<div align="center">

[![Deploy Frontend](https://img.shields.io/badge/Deploy-Frontend-blue?style=for-the-badge&logo=render)](https://render.com)
[![Deploy Admin](https://img.shields.io/badge/Deploy-Admin-green?style=for-the-badge&logo=render)](https://render.com)
[![Deploy Backend](https://img.shields.io/badge/Deploy-Backend-orange?style=for-the-badge&logo=render)](https://render.com)

</div>

---

## 👨‍💻 Author

**Piyush**

- GitHub: [@piyush2602](https://github.com/piyush2602)
- Project Link: [Medico-Project](https://github.com/piyush2602/Medico-Project)

---

<div align="center">

### ⭐ Give this repo a star if you found it helpful!

[![GitHub stars](https://img.shields.io/github/stars/piyush2602/Medico-Project?style=social)](https://github.com/piyush2602/Medico-Project/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/piyush2602/Medico-Project?style=social)](https://github.com/piyush2602/Medico-Project/network/members)

</div>

---

<div align="center">
Made with ❤️ by Piyush
</div>


