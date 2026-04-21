# Student Attendance Management System

A full-stack web application for managing student attendance using QR codes and GPS location verification.

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS (Neo-brutalist UI)
- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL
- **QR Library**: qrcode.react (frontend), qrcode (backend)
- **Location**: Browser Geolocation API

## Features

### Teacher Features
- 📊 Dashboard with attendance statistics and weekly trends
- 📚 My Courses - view all assigned courses
- 🔐 Start Class - generate QR codes that auto-refresh every 90 seconds
- 👁️ Live Attendance - see real-time count of students marking attendance
- 📋 Attendance Records - filter by course/date and export to CSV
- ⚠️ At-Risk Students - identify students below 75% attendance

### Student Features
- 📱 Dashboard - view attendance percentage for each course
- 👁️ Attendance Status - quick view of course status (Good, At Risk, Critical)
- 📷 Scan & Mark - open camera and scan teacher's QR code
- 🗺️ GPS Verification - app checks if you're within 50m of classroom
- 📅 Attendance History - detailed view of all attendance records
- ✓ Success/Error Messages - instant feedback on attendance marking

## Database Schema

```sql
-- Main Tables
departments
teachers
students
courses (with classroom GPS coordinates)
qr_sessions (with auto-expiry)
attendance (with GPS location tracking)

-- Views
attendance_summary (aggregated attendance per student per course)

-- Triggers
Automatic QR session deactivation when new session is created
```

## Installation

### 1. Prerequisites
- Node.js (v16+)
- PostgreSQL (v12+)
- npm or yarn

### 2. Clone and Setup

```bash
# Navigate to project directory
cd d:\CODINGG-PROJECTSSS\attendance

# Backend Setup
cd backend
npm install

# Frontend Setup
cd ../frontend
npm install
```

### 3. Database Setup

```bash
# Create PostgreSQL database
createdb attendance_db

# Update .env file in backend folder with your database URL
DATABASE_URL=postgresql://username:password@localhost:5432/attendance_db

# Initialize database schema
cd backend
npm run db:init

# Seed with sample data
npm run seed
```

### 4. Start the Application

**Terminal 1 - Backend Server:**
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:5000`

**Terminal 2 - Frontend Development Server:**
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:3000`

## Sample Credentials

### Teachers
- Email: `alice@school.edu`
- Password: `teacher1`

**OR**

- Email: `bob@school.edu`
- Password: `teacher2`

### Students
- Email: `raj@student.edu`
- Password: `student1`

**OR**

- Email: `priya@student.edu`
- Password: `student2`

## API Routes

### Authentication
- `POST /api/auth/teacher/login` - Teacher login
- `POST /api/auth/student/login` - Student login

### Teacher Routes
- `GET /api/teacher/profile` - Get teacher profile
- `GET /api/teacher/courses` - Get all courses
- `GET /api/teacher/dashboard` - Get dashboard stats
- `POST /api/teacher/courses/:courseId/start-session` - Start QR session
- `GET /api/teacher/courses/:courseId/live-attendance` - Live attendance count
- `GET /api/teacher/attendance?course_id=&date=` - Get attendance records
- `GET /api/teacher/at-risk` - Get at-risk students

### Student Routes
- `GET /api/student/profile` - Get student profile
- `GET /api/student/dashboard` - Get courses and attendance %
- `POST /api/student/mark-attendance` - Mark attendance
- `GET /api/student/attendance-history` - Get attendance history

## Anti-Proxy Security

When a student marks attendance:
1. Validates QR token exists and is not expired
2. Retrieves classroom location from database
3. Calculates Haversine distance from student's GPS
4. Rejects if distance > allowed radius (default 50m)
5. Prevents duplicate marking with unique constraint
6. Records student's GPS coordinates with attendance

## Neo-Brutalist Design Elements

- Off-white/cream background (#F5F0E8)
- Bold 2-3px black borders on all card:
- Hard 4px 4px 0px black box shadows
- Coral/Red accent (#FF4B4B) for primary actions
- Yellow (#FFD43B) and Purple (#9B8FFF) secondary accents
- Bold uppercase labels and large stat numbers
- Sidebar navigation with dark borders

## Production Deployment

Before deploying:
1. Change `JWT_SECRET` in `.env`
2. Update `DATABASE_URL` to production database
3. Set `NODE_ENV=production`
4. Run: `npm run build` in frontend directory
5. Serve frontend build directory as static files
6. Use environment variables for sensitive data

## Troubleshooting

**QR Code not scanning?**
- Check camera permissions in browser
- Ensure QR session is active (check in browser console)
- Get close to QR code

**Attendance marking fails?**
- Enable GPS in browser/device settings
- Check if you're within 50m of classroom
- Verify QR code hasn't expired (2 minute expiry)

**Database connection error?**
- Check PostgreSQL is running
- Verify DATABASE_URL in `.env`
- Run `npm run db:init` to create tables

## File Structure

```
attendance/
├── backend/
│   ├── server.js              # Main Express server
│   ├── auth.js                # JWT authentication
│   ├── db.js                  # Database connection
│   ├── distance.js            # Haversine formula
│   ├── db-init.js             # Database schema
│   ├── seed.js                # Sample data
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main app component
│   │   ├── main.jsx           # Entry point
│   │   ├── index.css          # Tailwind styles
│   │   ├── store/
│   │   │   └── authStore.js   # Zustand auth store
│   │   ├── utils/
│   │   │   └── api.js         # Axios instance
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Toast.jsx
│   │   │   └── Html5QrcodePlugin.jsx
│   │   └── pages/
│   │       ├── LandingPage.jsx
│   │       ├── TeacherLogin.jsx
│   │       ├── StudentLogin.jsx
│   │       ├── teacher/
│   │       │   ├── Dashboard.jsx
│   │       │   ├── Courses.jsx
│   │       │   ├── StartClass.jsx
│   │       │   ├── AttendanceRecords.jsx
│   │       │   └── AtRiskStudents.jsx
│   │       └── student/
│   │           ├── Dashboard.jsx
│   │           ├── ScanAttendance.jsx
│   │           └── AttendanceHistory.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

## License

MIT

## Support

For issues or questions, please create an issue in the project repository.
