# Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in a new terminal)
cd frontend
npm install
```

### Step 2: Setup PostgreSQL Database

```bash
# Create the database
createdb attendance_db

# In PostgreSQL:
# CREATE USER attendance_user WITH PASSWORD 'your_secure_password';
# ALTER ROLE attendance_user WITH CREATEDB;
# GRANT ALL PRIVILEGES ON DATABASE attendance_db TO attendance_user;
```

### Step 3: Configure Backend

Edit `backend/.env`:
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/attendance_db
JWT_SECRET=your_jwt_secret_key_change_in_production
PORT=5000
NODE_ENV=development
```

### Step 4: Initialize Database

```bash
cd backend
npm run db:init    # Create tables and schema
npm run seed       # Add sample data
```

### Step 5: Start Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Server will start on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# App will open on http://localhost:3000
```

## 🔐 Test the System

### Teacher Flow
1. Go to http://localhost:3000
2. Click "Teacher Login"
3. Use: `alice@school.edu` / `teacher1`
4. Go to "My Courses"
5. Click "START CLASS" on any course
6. A QR code will display with live attendance count

### Student Flow
1. Go to http://localhost:3000
2. Click "Student Login"
3. Use: `raj@student.edu` / `student1`
4. Go to "Scan Attendance"
5. Click "Open Camera"
6. Scan the teacher's QR code (or point camera at it)
7. Allow location access when prompted
8. See success message if within 50m of classroom

## 📁 Project Structure

```
attendance/
├── backend/           # Node.js + Express API server
├── frontend/          # React + Vite web application
├── README.md          # Full documentation
└── QUICKSTART.md      # This file
```

## 🛠️ Available Commands

### Backend
```bash
npm start       # Start server in production
npm run dev     # Start with auto-reload (nodemon)
npm run db:init # Initialize database schema
npm run seed    # Populate sample data
```

### Frontend
```bash
npm run dev     # Start dev server with hot reload
npm run build   # Build for production
npm run preview # Preview production build
```

## 📊 Database Schema Overview

- **departments** - Academic departments
- **teachers** - Teacher accounts with credentials
- **students** - Student accounts with roll numbers
- **courses** - Courses with GPS classroom location
- **qr_sessions** - QR tokens that expire in 2 minutes
- **attendance** - Student attendance records with GPS data
- **attendance_summary** - View showing attendance percentages

## 🔒 Security Features

✓ JWT authentication (separate tokens for teachers/students)
✓ Password hashing with bcryptjs
✓ GPS distance verification (Haversine formula)
✓ Automatic QR session expiry (2 minutes)
✓ Duplicate attendance prevention
✓ Role-based access control

## 📱 Testing on Mobile

1. Frontend must be accessible from phone (check local IP)
2. Browser must have permission to access GPS
3. Student must physically be near classroom coordinates (28.6139, 77.2090 in demo)
4. Within 50m radius for attendance to be marked

## 🐛 Troubleshooting

**Database connection failed:**
```bash
# Check PostgreSQL is running
# macOS: brew services start postgresql
# Windows: Start PostgreSQL service from Services
# Linux: sudo systemctl start postgresql
```

**Port already in use:**
```bash
# Change PORT in backend/.env or vite.config.js
# Or kill existing process on the port
```

**QR Code not detected:**
- Check lighting
- Ensure QR is fully visible
- Try using the generated QR image file
- Check browser console for errors

**GPS not working:**
- Enable location in browser settings
- Use HTTPS for geo location (except localhost)
- Check browser privacy settings

## 📚 Sample Data

Seed script creates:
- 2 teachers with different departments
- 10 students across 2 departments
- 3 courses with assigned teachers
- Sample attendance records for testing

All passwords are format: `role#` (e.g., `teacher1`, `student5`)

## 🎨 UI Features

- Neo-brutalist design with bold borders
- Responsive grid layouts
- Neo-brutalist stat cards
- Real-time live attendance counter
- QR code auto-refresh every 90 seconds
- Toast notifications for feedback
- Export to CSV functionality

## 📞 Support

Check the full README.md for:
- Complete API documentation
- Deployment instructions
- Environment configuration
- Advanced features

## Next Steps

1. ✅ Run quick start setup
2. Test teacher and student flows
3. Customize classroom GPS coordinates
4. Add more students/courses
5. Deploy to production

Happy attendance tracking! 📚✓
