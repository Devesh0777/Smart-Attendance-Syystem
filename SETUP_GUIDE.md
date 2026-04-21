# 🎓 Student Attendance Management System - Complete Setup Guide

## Project Overview

This is a **full-stack web application** for managing student attendance using QR codes and GPS location verification with a **neo-brutalist UI design**.

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    REACT FRONTEND (Vite)                     │
│             [Browser] Port 3000                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ • Teacher Dashboard • Student Dashboard               │   │
│  │ • QR Scanner • Attendance History                    │   │
│  │ • GPS Integration • Real-time Updates                │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────┬───────────────────────────────────────┘
                       │ REST API (JSON)
                       │
┌──────────────────────┴───────────────────────────────────────┐
│            EXPRESS.JS BACKEND (Node.js)                      │
│              Port 5000                                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ • JWT Authentication • QR Session Management         │   │
│  │ • GPS Distance Calculation (Haversine)              │   │
│  │ • Real-time Attendance Tracking                      │   │
│  │ • CSV Export Functionality                           │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────┬───────────────────────────────────────┘
                       │ SQL Queries
                       │
┌──────────────────────┴───────────────────────────────────────┐
│              POSTGRESQL DATABASE                             │
│         [Local] Port 5432 (Default)                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ • Teachers • Students • Courses                       │   │
│  │ • QR Sessions • Attendance Records                    │   │
│  │ • GPS Tracking Data                                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## ⚙️ Prerequisites

Before starting, ensure you have:

1. **Node.js** v16 or higher
   ```bash
   node --version  # Should show v16.0.0 or higher
   ```

2. **PostgreSQL** v12 or higher
   ```bash
   psql --version  # Should show psql 12.0 or higher
   ```

3. **npm** or **yarn** (comes with Node.js)
   ```bash
   npm --version
   ```

4. **Git** (optional, for version control)

## 📦 Installation Steps

### Step 1: Navigate to Project Directory

```bash
cd d:\CODINGG\ PROJECTSSS\attendance
```

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

This installs:
- express - Web framework
- pg - PostgreSQL driver
- jsonwebtoken - JWT authentication
- bcryptjs - Password hashing
- qrcode - QR generation
- cors & body-parser - Middleware
- dotenv - Environment variables

### Step 3: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

This installs:
- react & react-dom - UI framework
- react-router-dom - Routing
- vite - Build tool
- tailwindcss - Styling
- qrcode.react - QR display
- html5-qrcode - QR scanning
- zustand - State management
- chart.js - Charts

## 🗄️ Database Setup

### Option 1: Using PostgreSQL Command Line

```bash
# Open PostgreSQL
psql -U postgres

# In PostgreSQL shell, run:
CREATE DATABASE attendance_db;
\connect attendance_db
```

### Option 2: Using pgAdmin

1. Open pgAdmin
2. Right-click "Databases" → Create → Database
3. Name: `attendance_db`
4. Click Save

### Step 3: Configure Backend

Edit `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/attendance_db
JWT_SECRET=your_super_secret_jwt_key_12345_change_in_production
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
```

**⚠️ Important:**
- Replace `password` with your PostgreSQL password
- Change `JWT_SECRET` to a random string in production
- If you created a different user, update the connection string

### Step 4: Initialize Database Schema

```bash
cd backend
npm run db:init
```

This will:
- Create all tables (departments, teachers, students, courses, etc.)
- Create the attendance_summary view
- Create triggers for auto-expiring QR sessions

Expected output: `✅ Database schema initialized successfully!`

### Step 5: Seed Sample Data

```bash
npm run seed
```

This will:
- Create 2 departments (CS, Electronics)
- Create 2 teachers with credentials
- Create 10 students with credentials
- Create 3 courses with GPS coordinates
- Generate sample attendance data

Expected output shows sample login credentials.

## 🚀 Starting the Application

### Terminal 1: Start Backend Server

```bash
cd backend
npm run dev
```

Expected output:
```
✅ Server running on port 5000
```

### Terminal 2: Start Frontend Dev Server

```bash
cd frontend
npm run dev
```

Expected output:
```
  VITE v5.0.8  ready in 123 ms
  ➜  Local:   http://localhost:3000/
```

## 🔐 Testing the Application

### Test Teacher Dashboard

1. Go to http://localhost:3000
2. Click "👨‍🏫 Teacher Login"
3. Email: `alice@school.edu`
4. Password: `teacher1`
5. Click "LOGIN"

You should see:
- Teacher Dashboard with stat cards
- Weekly attendance chart
- Navigation sidebar

### Test Starting a Class

1. In teacher dashboard, click "MY COURSES"
2. Click "START CLASS" on any course
3. A QR code should display ✓
4. Should show "Live Attendance" counter

### Test Student Attendance

1. Open another browser tab
2. Go to http://localhost:3000
3. Click "👨‍🎓 Student Login"
4. Email: `raj@student.edu`
5. Password: `student1`
6. Click "Mark Attendance"
7. Click "Open Camera"

Note: For development, you'll need to either:
- Point camera at the displayed teacher QR code
- Manually enter the QR token in browser console
- Use a QR code image file

## 📊 Database Schema Summary

### Tables Created

```
departments
├── id (PRIMARY KEY)
├── name

teachers
├── id (PRIMARY KEY)
├── name
├── email (UNIQUE)
├── password_hash
└── department_id (FOREIGN KEY)

students
├── id (PRIMARY KEY)
├── name
├── roll_no (UNIQUE)
├── email (UNIQUE)
├── password_hash
└── department_id (FOREIGN KEY)

courses
├── id (PRIMARY KEY)
├── name
├── teacher_id (FOREIGN KEY)
├── department_id (FOREIGN KEY)
├── classroom_latitude
├── classroom_longitude
└── allowed_radius_meters (default: 50m)

qr_sessions
├── id (PRIMARY KEY)
├── course_id (FOREIGN KEY)
├── qr_token (UUID, UNIQUE)
├── generated_at
├── expires_at (auto-expires in 2 min)
└── is_active

attendance
├── id (PRIMARY KEY)
├── student_id (FOREIGN KEY)
├── course_id (FOREIGN KEY)
├── session_id (FOREIGN KEY)
├── marked_at
├── student_latitude
├── student_longitude
├── is_present
└── UNIQUE(student_id, session_id)
```

## 🔌 API Endpoints Quick Reference

### Authentication
```
POST /api/auth/teacher/login
POST /api/auth/student/login
```

### Teacher APIs
```
GET  /api/teacher/profile
GET  /api/teacher/courses
GET  /api/teacher/dashboard
POST /api/teacher/courses/:id/start-session
GET  /api/teacher/courses/:id/live-attendance
GET  /api/teacher/attendance?course_id=&date=
GET  /api/teacher/at-risk
```

### Student APIs
```
GET  /api/student/profile
GET  /api/student/dashboard
POST /api/student/mark-attendance
GET  /api/student/attendance-history
```

## 🎨 UI Features

### Neo-Brutalist Design
- Off-white background (#F5F0E8)
- Bold 2-3px black borders
- Hard shadows (4px 4px 0px black)
- Coral red (#FF4B4B), Yellow (#FFD43B), Purple (#9B8FFF)
- Uppercase labels, large stat numbers

### Responsive Layout
- Sidebar navigation (left)
- Main content (right)
- Grid layouts for cards
- Mobile-friendly for QR scanning

## ✅ Verification Checklist

After setup, verify:

- [ ] Backend server running on http://localhost:5000
- [ ] Frontend running on http://localhost:3000
- [ ] Can access landing page with login options
- [ ] Teacher login works with sample credentials
- [ ] Teacher dashboard shows stat cards
- [ ] Student login works
- [ ] Student dashboard shows courses
- [ ] QR code generates when starting class
- [ ] Browser console shows no errors

## 🐛 Common Issues & Fixes

### Issue: "Database connection error"
```bash
# Check PostgreSQL is running
# Windows: Services → PostgreSQL
# macOS: brew services list
# Linux: sudo systemctl status postgresql

# Verify DATABASE_URL in backend/.env
# Test connection:
psql -U postgres -d attendance_db
```

### Issue: "Port 5000 already in use"
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process
taskkill /PID <PID> /F

# Or change port in backend/.env
```

### Issue: "npm install fails"
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue: "CORS errors"
- Backend already has CORS enabled
- Check frontend is on http://localhost:3000
- Check backend is on http://localhost:5000

## 📝 Sample Request/Response

### Teacher Login
```bash
curl -X POST http://localhost:5000/api/auth/teacher/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@school.edu","password":"teacher1"}'

# Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": 1,
  "role": "teacher"
}
```

### Mark Attendance
```bash
curl -X POST http://localhost:5000/api/student/mark-attendance \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "qrToken": "550e8400-e29b-41d4-a716-446655440000",
    "latitude": 28.6139,
    "longitude": 77.2090
  }'

# Response:
{
  "success": true,
  "message": "Attendance marked successfully",
  "attendanceId": 123
}
```

## 🚢 Production Deployment

Before deploying to production:

1. **Security**
   - Change `JWT_SECRET` to a random 32+ character string
   - Use HTTPS/SSL certificates
   - Set `NODE_ENV=production`

2. **Database**
   - Use remote PostgreSQL (AWS RDS, Azure Database, etc.)
   - Update `DATABASE_URL`
   - Enable SSL for database connection

3. **Backend**
   - Use environment variables from .env
   - Deploy to: Heroku, AWS, Digital Ocean, etc.
   - Set up monitoring and logging

4. **Frontend**
   - Run `npm run build`
   - Deploy static files to: Vercel, Netlify, S3, etc.
   - Update API URL to production backend

5. **Environment**
   - Never commit `.env` file
   - Use `.env.example` for reference
   - Use secrets management for production

## 📞 Support & Resources

### Helpful Commands

```bash
# Check server status
curl http://localhost:5000/api/health

# View database
psql -U postgres -d attendance_db

# Monitor backend logs
npm run dev  # Shows all logs

# Clear frontend cache
rm -rf node_modules dist
npm install && npm run build
```

### Documentation Files
- `README.md` - Full documentation
- `QUICKSTART.md` - Quick reference
- `.env.example` - Environment template

## 🎉 You're All Set!

Your Student Attendance Management System is now ready!

### Next Steps:
1. Explore teacher and student interfaces
2. Test QR code generation and scanning
3. Check attendance records and analytics
4. Customize GPS coordinates for your campus
5. Add more students/courses as needed

Happy attendance tracking! 📚✓
