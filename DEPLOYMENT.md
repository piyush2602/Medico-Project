# Medico Project - Render Deployment Guide

This guide will walk you through deploying the Medico fullstack application on Render.

## Prerequisites

- GitHub repository with your code (✅ Already done: https://github.com/piyush2602/Medico-Project.git)
- Render account (Sign up at https://render.com)
- MongoDB Atlas database with IP whitelist set to `0.0.0.0/0` (allow all IPs)

## Architecture

- **Backend**: Web Service (Node.js/Express API)
- **Frontend**: Static Site (React/Vite)
- **Admin Panel**: Static Site (React/Vite)

## Deployment Steps

### Step 1: Deploy Backend API

1. **Go to Render Dashboard**: https://dashboard.render.com/
2. **Click "New +" → "Web Service"**
3. **Connect your GitHub repository**: `piyush2602/Medico-Project`
4. **Configure the service**:
   - **Name**: `medico-backend` (or your choice)
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or paid for better performance)

5. **Add Environment Variables** (click "Advanced" → "Add Environment Variable"):
   ```
   MONGODB_URI=mongodb+srv://Medico:Piyush123@cluster0.wq8rqog.mongodb.net/Medico
   CLOUDINARY_NAME=dz0kl5sjp
   CLOUDINARY_API_KEY=764149719867189
   CLOUDINARY_SECRET_KEY=3WDU10QVr5feOkomC9r7JgZNS1U
   ADMIN_EMAIL=medico@gmail.com
   ADMIN_PASSWORD=Piyush123
   JWT_SECRET=fullstack
   PORT=4000
   ```

6. **Click "Create Web Service"**
7. **Wait for deployment** (5-10 minutes)
8. **Copy the backend URL** (e.g., `https://medico-backend-xxxx.onrender.com`)
9. **Test the backend**: Visit the URL - you should see "API WORKING"

---

### Step 2: Deploy Frontend

1. **Click "New +" → "Static Site"**
2. **Connect your GitHub repository**: `piyush2602/Medico-Project`
3. **Configure the service**:
   - **Name**: `medico-frontend` (or your choice)
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. **Add Environment Variable**:
   ```
   VITE_BACKEND_URL=<YOUR_BACKEND_URL_FROM_STEP_1>
   ```
   Example: `VITE_BACKEND_URL=https://medico-backend-xxxx.onrender.com`

5. **Click "Create Static Site"**
6. **Wait for deployment** (5-10 minutes)
7. **Copy the frontend URL** (e.g., `https://medico-frontend-xxxx.onrender.com`)
8. **Test the frontend**: Visit the URL and verify it loads correctly

---

### Step 3: Deploy Admin Panel

1. **Click "New +" → "Static Site"**
2. **Connect your GitHub repository**: `piyush2602/Medico-Project`
3. **Configure the service**:
   - **Name**: `medico-admin` (or your choice)
   - **Branch**: `main`
   - **Root Directory**: `admin`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. **Add Environment Variable**:
   ```
   VITE_BACKEND_URL=<YOUR_BACKEND_URL_FROM_STEP_1>
   ```
   Example: `VITE_BACKEND_URL=https://medico-backend-xxxx.onrender.com`

5. **Click "Create Static Site"**
6. **Wait for deployment** (5-10 minutes)
7. **Copy the admin URL** (e.g., `https://medico-admin-xxxx.onrender.com`)
8. **Test the admin panel**: Visit the URL and login with:
   - Email: `medico@gmail.com`
   - Password: `Piyush123`

---

## Post-Deployment

### Update CORS (if needed)

If you encounter CORS errors, update the backend `server.js` to allow your frontend domains:

```javascript
app.use(cors({
  origin: [
    'https://medico-frontend-xxxx.onrender.com',
    'https://medico-admin-xxxx.onrender.com'
  ]
}))
```

Then commit and push to trigger a redeployment.

### MongoDB Atlas Network Access

Ensure MongoDB Atlas allows connections from anywhere:
1. Go to MongoDB Atlas → Network Access
2. Add IP Address: `0.0.0.0/0`
3. Comment: "Allow from Render"

---

## Important Notes

### Free Tier Limitations
- Free services spin down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- Consider upgrading to paid tier for production use

### Automatic Deployments
- Render automatically redeploys when you push to GitHub
- Each service watches the `main` branch

### Environment Variables
- Can be updated in Render dashboard under "Environment"
- Changes require manual redeployment (click "Manual Deploy" → "Deploy latest commit")

---

## Troubleshooting

### Backend Issues
- Check logs in Render dashboard
- Verify MongoDB connection string
- Ensure MongoDB Atlas allows connections from `0.0.0.0/0`

### Frontend/Admin Issues
- Check browser console for errors
- Verify `VITE_BACKEND_URL` is set correctly
- Ensure backend URL is accessible (no trailing slash)

### Build Failures
- Check Render build logs
- Verify `package.json` scripts are correct
- Ensure all dependencies are listed in `package.json`

---

## Your Deployment URLs

After deployment, save your URLs here:

- **Backend API**: `https://medico-backend-xxxx.onrender.com`
- **Frontend**: `https://medico-frontend-xxxx.onrender.com`
- **Admin Panel**: `https://medico-admin-xxxx.onrender.com`

---

## Next Steps

1. Test all functionality on deployed applications
2. Update README.md with deployment URLs
3. Set up custom domains (optional)
4. Configure monitoring and alerts in Render
5. Consider upgrading to paid tier for better performance
