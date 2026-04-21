import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';
import { useToast, Toast } from '../../components/Toast';

export default function AttendanceRecords() {
  const [records, setRecords] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseId, setCourseId] = useState('');
  const [date, setDate] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [students, setStudents] = useState([]);
  const [manualForm, setManualForm] = useState({ student_id: '', course_id: '', date: '', is_present: true });
  const [submitting, setSubmitting] = useState(false);
  const { showToast, toasts } = useToast();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/teacher/courses');
        setCourses(response.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (courseId) params.append('course_id', courseId);
        if (date) params.append('date', date);
        const response = await api.get(`/teacher/attendance?${params.toString()}`);
        setRecords(response.data);
      } catch (error) {
        console.error('Error fetching records:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, [courseId, date]);

  const handleExportCSV = () => {
    const headers = ['Student Name', 'Roll No', 'Course', 'Marked At', 'Status'];
    const rows = records.map((r) => [
      r.student_name, r.roll_no, r.course_name,
      new Date(r.marked_at).toLocaleString(),
      r.is_present ? 'Present' : 'Absent',
    ]);
    let csv = headers.join(',') + '\n';
    rows.forEach((row) => {
      csv += row.map((cell) => `"${cell}"`).join(',') + '\n';
    });
    const link = document.createElement('a');
    link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    link.download = 'attendance_records.csv';
    link.click();
  };

  const openModal = async () => {
    setShowModal(true);
    setManualForm({ student_id: '', course_id: courses[0]?.id || '', date: '', is_present: true });
    if (courses.length > 0) {
      try {
        const res = await api.get(`/teacher/courses/${courses[0].id}/students`);
        setStudents(res.data);
      } catch (e) {
        console.error('Error fetching students:', e);
      }
    }
  };

  const handleCourseChange = async (cid) => {
    setManualForm(f => ({ ...f, course_id: cid }));
    if (cid) {
      try {
        const res = await api.get(`/teacher/courses/${cid}/students`);
        setStudents(res.data);
      } catch (e) {
        console.error('Error fetching students:', e);
      }
    }
  };

  const handleManualSubmit = async () => {
    if (!manualForm.student_id || !manualForm.course_id || !manualForm.date) {
      showToast('Please fill all fields', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/teacher/attendance/manual', {
        student_id: parseInt(manualForm.student_id),
        course_id: parseInt(manualForm.course_id),
        date: manualForm.date,
        is_present: manualForm.is_present,
      });
      showToast('Attendance updated!', 'success');
      setShowModal(false);
      // Refresh records
      const params = new URLSearchParams();
      if (courseId) params.append('course_id', courseId);
      if (date) params.append('date', date);
      const response = await api.get(`/teacher/attendance?${params.toString()}`);
      setRecords(response.data);
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to update', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar role="teacher" />
      <Toast toasts={toasts} />
      <div className="flex-1 p-8">
        <h1 className="text-4xl font-bold uppercase mb-8">Attendance Records</h1>

        <div className="neo-card mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-xs font-bold uppercase mb-2">Course</label>
              <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="input-field w-full">
                <option value="">All Courses</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-2">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field w-full" />
            </div>
            <div className="flex items-end">
              <button onClick={handleExportCSV} className="neo-button secondary w-full">📥 Export CSV</button>
            </div>
            <div className="flex items-end">
              <button onClick={openModal} className="neo-button primary w-full">➕ Add Manual</button>
            </div>
          </div>
        </div>

        <div className="neo-card">
          {loading ? (
            <p>Loading...</p>
          ) : records.length === 0 ? (
            <p className="text-center py-8">No records found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-black">
                    <th className="text-left py-3 px-4 font-bold uppercase text-sm">Student</th>
                    <th className="text-left py-3 px-4 font-bold uppercase text-sm">Roll No</th>
                    <th className="text-left py-3 px-4 font-bold uppercase text-sm">Course</th>
                    <th className="text-left py-3 px-4 font-bold uppercase text-sm">Marked At</th>
                    <th className="text-left py-3 px-4 font-bold uppercase text-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record, idx) => (
                    <tr key={idx} className={`border-b border-gray-300 ${record.is_present ? 'bg-green-50' : 'bg-red-50'}`}>
                      <td className="py-3 px-4">{record.student_name}</td>
                      <td className="py-3 px-4">{record.roll_no}</td>
                      <td className="py-3 px-4">{record.course_name}</td>
                      <td className="py-3 px-4">{new Date(record.marked_at).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 font-bold uppercase text-xs ${
                          record.is_present ? 'bg-green-400 text-white' : 'bg-red-400 text-white'
                        }`}>
                          {record.is_present ? '✓ Present' : '✗ Absent'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Manual Attendance Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-xl font-bold uppercase mb-6 border-b-2 border-black pb-3">Add Manual Attendance</h2>

              <div className="mb-4">
                <label className="block text-xs font-bold uppercase mb-2">Course</label>
                <select
                  value={manualForm.course_id}
                  onChange={(e) => handleCourseChange(e.target.value)}
                  className="input-field w-full"
                >
                  <option value="">Select Course</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-bold uppercase mb-2">Student</label>
                <select
                  value={manualForm.student_id}
                  onChange={(e) => setManualForm(f => ({ ...f, student_id: e.target.value }))}
                  className="input-field w-full"
                >
                  <option value="">Select Student</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.roll_no})</option>)}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-bold uppercase mb-2">Date</label>
                <input
                  type="date"
                  value={manualForm.date}
                  onChange={(e) => setManualForm(f => ({ ...f, date: e.target.value }))}
                  className="input-field w-full"
                />
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold uppercase mb-2">Status</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setManualForm(f => ({ ...f, is_present: true }))}
                    className={`flex-1 py-3 font-bold uppercase text-sm border-2 border-black transition-all ${
                      manualForm.is_present ? 'bg-green-400 text-white shadow-neo' : 'bg-white'
                    }`}
                  >
                    ✓ Present
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualForm(f => ({ ...f, is_present: false }))}
                    className={`flex-1 py-3 font-bold uppercase text-sm border-2 border-black transition-all ${
                      !manualForm.is_present ? 'bg-red-400 text-white shadow-neo' : 'bg-white'
                    }`}
                  >
                    ✗ Absent
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setShowModal(false)} className="neo-button secondary flex-1">Cancel</button>
                <button onClick={handleManualSubmit} className="neo-button primary flex-1" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
