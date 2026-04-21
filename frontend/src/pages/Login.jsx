import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuthStore } from '../store/authStore';
import { useToast, Toast } from '../components/Toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { showToast, toasts } = useToast();
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const validate = () => {
    const errs = {};
    if (!email) errs.email = 'Email is required';
    if (!password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const endpoint = role === 'teacher' ? '/auth/teacher/login' : '/auth/student/login';
      const response = await api.post(endpoint, { email, password });
      login(response.data.token, response.data.userId, response.data.role, response.data.name);
      showToast('Login successful!', 'success');
      setTimeout(() => navigate(role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'), 800);
    } catch (error) {
      showToast(error.response?.data?.error || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F5F0E8]">
      <Toast toasts={toasts} />
      <div className="neo-card max-w-md w-full">
        <h1 className="text-3xl font-bold uppercase mb-6 border-b-2 border-black pb-4">Login</h1>

        {/* Role Toggle */}
        <div className="flex mb-6 border-2 border-black">
          <button
            type="button"
            onClick={() => setRole('student')}
            className={`flex-1 py-3 font-bold uppercase text-sm transition-all ${
              role === 'student' ? 'bg-[#FF4B4B] text-white' : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            👨‍🎓 I am a Student
          </button>
          <button
            type="button"
            onClick={() => setRole('teacher')}
            className={`flex-1 py-3 font-bold uppercase text-sm border-l-2 border-black transition-all ${
              role === 'teacher' ? 'bg-[#9B8FFF] text-white' : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            👨‍🏫 I am a Teacher
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-xs font-bold uppercase mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
              placeholder="your@email.edu"
              className="input-field w-full"
              required
            />
            {errors.email && <p className="text-red-500 text-xs mt-1 font-bold">{errors.email}</p>}
          </div>

          <div className="mb-6">
            <label className="block text-xs font-bold uppercase mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
              placeholder="••••••••"
              className="input-field w-full"
              required
            />
            {errors.password && <p className="text-red-500 text-xs mt-1 font-bold">{errors.password}</p>}
          </div>

          <button type="submit" className="neo-button primary w-full" disabled={loading}>
            {loading ? 'LOGGING IN...' : 'LOGIN'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm">
          Don't have an account?{' '}
          <Link
            to={role === 'teacher' ? '/signup/teacher' : '/signup/student'}
            className="text-[#FF4B4B] font-bold uppercase hover:underline"
          >
            Sign Up
          </Link>
        </p>

        <Link to="/" className="block text-center mt-4 text-blue-600 font-bold uppercase text-xs hover:underline">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
