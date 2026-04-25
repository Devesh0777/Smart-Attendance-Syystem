import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuthStore } from '../store/authStore';
import { useToast, Toast } from '../components/Toast';

export default function TeacherSignup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { showToast, toasts } = useToast();
  const navigate = useNavigate();
  const { login } = useAuthStore();

  useEffect(() => {
    api.get('/departments').then(res => {
      // Deduplicate departments by id
      const unique = [...new Map(res.data.map(d => [d.id, d])).values()];
      setDepartments(unique);
    }).catch(err => {
      console.error('Failed to load departments:', err);
    });
  }, []);

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (!email) errs.email = 'Email is required';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (!departmentId) errs.department = 'Department is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await api.post('/auth/teacher/signup', {
        name, email, password, department_id: parseInt(departmentId),
      });
      login(response.data.token, response.data.userId, response.data.role, response.data.name);
      showToast('Account created successfully!', 'success');
      setTimeout(() => navigate('/teacher/dashboard'), 800);
    } catch (error) {
      showToast(error.response?.data?.error || 'Signup failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F5F0E8]">
      <Toast toasts={toasts} />
      <div className="neo-card max-w-md w-full">
        <h1 className="text-3xl font-bold uppercase mb-6 border-b-2 border-black pb-4">Teacher Sign Up</h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-xs font-bold uppercase mb-2">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Dr. John Doe" className="input-field w-full" />
            {errors.name && <p className="text-red-500 text-xs mt-1 font-bold">{errors.name}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold uppercase mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.edu" className="input-field w-full" />
            {errors.email && <p className="text-red-500 text-xs mt-1 font-bold">{errors.email}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold uppercase mb-2">Department</label>
            <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}
              className="input-field w-full">
              <option value="">Select Department</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            {errors.department && <p className="text-red-500 text-xs mt-1 font-bold">{errors.department}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold uppercase mb-2">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 characters" className="input-field w-full" />
            {errors.password && <p className="text-red-500 text-xs mt-1 font-bold">{errors.password}</p>}
          </div>

          <div className="mb-6">
            <label className="block text-xs font-bold uppercase mb-2">Confirm Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••" className="input-field w-full" />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-bold">{errors.confirmPassword}</p>}
          </div>

          <button type="submit" className="neo-button primary w-full" disabled={loading}>
            {loading ? 'CREATING ACCOUNT...' : 'SIGN UP'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-[#FF4B4B] font-bold uppercase hover:underline">Login</Link>
        </p>

        <Link to="/" className="block text-center mt-4 text-blue-600 font-bold uppercase text-xs hover:underline">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
