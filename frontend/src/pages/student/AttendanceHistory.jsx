import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';

export default function StudentAttendanceHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseId, setCourseId] = useState('');
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/student/dashboard');
        setCourses(response.data.map((c) => ({ id: c.course_id, name: c.course_name })));
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchDashboard();
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const params = new URLSearchParams();
        if (courseId) params.append('courseId', courseId);

        const response = await api.get(`/student/attendance-history?${params.toString()}`);
        setHistory(response.data);
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [courseId]);

  return (
    <div className="flex">
      <Sidebar role="student" />
      <div className="flex-1 p-8">
        <h1 className="text-4xl font-bold uppercase mb-8">Attendance History</h1>

        <div className="neo-card mb-6">
          <label className="block text-xs font-bold uppercase mb-2">Filter by Course</label>
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="input-field w-full"
          >
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="neo-card">
          {loading ? (
            <p>Loading...</p>
          ) : history.length === 0 ? (
            <p className="text-center py-8">No attendance records found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-black">
                    <th className="text-left py-3 px-4 font-bold uppercase text-sm">Course</th>
                    <th className="text-left py-3 px-4 font-bold uppercase text-sm">Marked At</th>
                    <th className="text-left py-3 px-4 font-bold uppercase text-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((record, idx) => (
                    <tr
                      key={idx}
                      className={`border-b border-gray-300 ${
                        record.is_present ? 'bg-green-50' : 'bg-red-50'
                      }`}
                    >
                      <td className="py-3 px-4">{record.course_name}</td>
                      <td className="py-3 px-4">{new Date(record.marked_at).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 font-bold uppercase text-xs ${
                            record.is_present
                              ? 'bg-green-400 text-white'
                              : 'bg-red-400 text-white'
                          }`}
                        >
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
      </div>
    </div>
  );
}
