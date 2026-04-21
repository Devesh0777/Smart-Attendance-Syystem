import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';

export default function AtRiskStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAtRiskStudents = async () => {
      setLoading(true);
      try {
        const response = await api.get('/teacher/at-risk');
        setStudents(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching at-risk students:', error);
        setError(error.message || 'Failed to load at-risk students');
      } finally {
        setLoading(false);
      }
    };

    fetchAtRiskStudents();
  }, []);

  const getRiskBadgeColor = (percentage) => {
    if (percentage < 50) return 'bg-red-600 text-white';
    if (percentage < 75) return 'bg-yellow-500 text-white';
    return 'bg-orange-500 text-white';
  };

  return (
    <div className="flex">
      <Sidebar role="teacher" />
      <div className="flex-1 p-8">
        <h1 className="text-4xl font-bold uppercase mb-8">⚠️ At-Risk Students</h1>

        <div className="neo-card">
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <div className="text-red-600 border-2 border-red-600 p-4">
              <p className="font-bold">Error: {error}</p>
              <p className="text-sm mt-2">Check browser console for more details</p>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-lg font-bold">✅ No at-risk students!</p>
              <p className="text-sm text-gray-600 mt-2">All students have attendance &gt;= 75%</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {students.map((student, idx) => (
                <div key={idx} className="border-2 border-red-600 p-4 bg-red-50">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold uppercase">{student.student_name}</p>
                      <p className="text-xs text-gray-600">{student.roll_no}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-bold uppercase ${getRiskBadgeColor(student.attendance_percentage)}`}>
                      {parseFloat(student.attendance_percentage).toFixed(1)}%
                    </span>
                  </div>

                  <p className="text-sm mb-2">📚 {student.course_name}</p>
                  <p className="text-sm mb-3">
                    Present: {student.present_count}/{student.total_classes}
                  </p>

                  <div className="w-full bg-gray-300 rounded-full h-2">
                    <div
                      className={`h-2 ${
                        student.attendance_percentage < 50
                          ? 'bg-red-600'
                          : student.attendance_percentage < 75
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${student.attendance_percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
