import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Import pages
import Login from './pages/Login';
import TeacherSignup from './pages/TeacherSignup';
import StudentSignup from './pages/StudentSignup';
import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherCourses from './pages/teacher/Courses';
import StartClass from './pages/teacher/StartClass';
import AttendanceRecords from './pages/teacher/AttendanceRecords';
import AtRiskStudents from './pages/teacher/AtRiskStudents';
import StudentDashboard from './pages/student/Dashboard';
import ScanAttendance from './pages/student/ScanAttendance';
import StudentAttendanceHistory from './pages/student/AttendanceHistory';
import LandingPage from './pages/LandingPage';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { token, role } = useAuthStore();
  if (!token) return <Navigate to="/login" />;
  if (requiredRole && role !== requiredRole) return <Navigate to="/" />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup/teacher" element={<TeacherSignup />} />
        <Route path="/signup/student" element={<StudentSignup />} />

        {/* Teacher Routes */}
        <Route
          path="/teacher/dashboard"
          element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/courses"
          element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherCourses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/courses/:courseId/start-class"
          element={
            <ProtectedRoute requiredRole="teacher">
              <StartClass />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/attendance"
          element={
            <ProtectedRoute requiredRole="teacher">
              <AttendanceRecords />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/at-risk"
          element={
            <ProtectedRoute requiredRole="teacher">
              <AtRiskStudents />
            </ProtectedRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/scan"
          element={
            <ProtectedRoute requiredRole="student">
              <ScanAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/history"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentAttendanceHistory />
            </ProtectedRoute>
          }
        />

        {/* Redirect old login routes */}
        <Route path="/teacher/login" element={<Navigate to="/login" />} />
        <Route path="/student/login" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
