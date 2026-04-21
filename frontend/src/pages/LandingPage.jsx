import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl text-center">
        <h1 className="text-6xl font-bold uppercase mb-6 border-4 border-black p-6 shadow-neo inline-block">
          ATTENDANCE
        </h1>
        <p className="text-xl font-bold uppercase mt-8 tracking-wider">Student Attendance Management System</p>

        <div className="grid grid-cols-2 gap-6 mt-16">
          <Link to="/login">
            <button className="neo-button primary w-full py-6 text-lg">
              🔐 Login
            </button>
          </Link>
          <Link to="/signup/student">
            <button className="neo-button secondary w-full py-6 text-lg">
              ✍️ Sign Up
            </button>
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-6">
          <div className="neo-card">
            <div className="text-4xl mb-2">📱</div>
            <p className="font-bold uppercase text-sm">QR Scanning</p>
            <p className="text-xs mt-2">Quick attendance marking</p>
          </div>
          <div className="neo-card">
            <div className="text-4xl mb-2">📍</div>
            <p className="font-bold uppercase text-sm">GPS Verification</p>
            <p className="text-xs mt-2">Location-based attendance</p>
          </div>
          <div className="neo-card">
            <div className="text-4xl mb-2">📊</div>
            <p className="font-bold uppercase text-sm">Analytics</p>
            <p className="text-xs mt-2">Real-time statistics</p>
          </div>
        </div>
      </div>
    </div>
  );
}
