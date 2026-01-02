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

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads
- **Cloudinary** - Image storage

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

## 💻 Local Development

### Prerequisites
- Node.js (v14+)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/piyush2602/Medico-Project.git
cd Medico
```

2. **Setup Backend**
```bash
cd backend
npm install

# Create .env file with:
# MONGODB_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret
# CLOUDINARY_NAME=your_cloudinary_name
# CLOUDINARY_API_KEY=your_cloudinary_api_key
# CLOUDINARY_API_SECRET=your_cloudinary_api_secret
# ADMIN_EMAIL=admin@medico.com
# ADMIN_PASSWORD=your_admin_password

npm run server
```

3. **Setup Frontend**
```bash
cd ../frontend
npm install

# Create .env file with:
# VITE_BACKEND_URL=http://localhost:4000

npm run dev
```

4. **Setup Admin Panel**
```bash
cd ../admin
npm install

# Create .env file with:
# VITE_BACKEND_URL=http://localhost:4000

npm run dev
```

### Access the Application
- **Frontend**: http://localhost:5173
- **Admin Panel**: http://localhost:5174
- **Backend API**: http://localhost:4000

---

## 🔐 Admin Credentials

For the deployed version, use the admin credentials you set up during backend configuration.

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


