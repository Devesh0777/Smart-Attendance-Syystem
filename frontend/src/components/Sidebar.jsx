import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Sidebar({ role }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const teacherMenu = [
    { label: 'Dashboard', path: '/teacher/dashboard' },
    { label: 'My Courses', path: '/teacher/courses' },
    { label: 'Attendance Records', path: '/teacher/attendance' },
    { label: 'At-Risk Students', path: '/teacher/at-risk' },
  ];

  const studentMenu = [
    { label: 'Dashboard', path: '/student/dashboard' },
    { label: 'Scan Attendance', path: '/student/scan' },
    { label: 'My History', path: '/student/history' },
  ];

  const menu = role === 'teacher' ? teacherMenu : studentMenu;

  return (
    <div className="sidebar">
      <div className="mb-8">
        <h1 className="text-2xl font-bold uppercase">ATTENDANCE</h1>
        <p className="text-xs uppercase mt-2 text-gray-600">Management System</p>
      </div>

      <nav className="flex-1 flex flex-col">
        {menu.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`block py-3 px-4 border-b-2 border-black text-sm font-bold uppercase cursor-pointer transition-all ${
              location.pathname === item.path
                ? 'bg-[#FF4B4B] text-white'
                : 'text-black hover:bg-gray-100'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="block w-full py-3 px-4 border-t-2 border-black bg-red-500 text-white font-bold uppercase text-sm cursor-pointer hover:bg-red-600 transition-all mt-4"
      >
        Logout
      </button>
    </div>
  );
}
