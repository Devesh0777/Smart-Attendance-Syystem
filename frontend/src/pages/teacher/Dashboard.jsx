import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const CHART_COLORS = ['#FF4B4B', '#9B8FFF', '#FFD43B', '#22c55e', '#3b82f6', '#f97316'];

export default function TeacherDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [trends, setTrends] = useState([]);
  const [courseNames, setCourseNames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, trendsRes] = await Promise.all([
          api.get('/teacher/dashboard'),
          api.get('/teacher/dashboard/trends'),
        ]);
        setDashboard(dashRes.data);
        setTrends(trendsRes.data);
        // Extract unique course names from trends data
        const names = new Set();
        trendsRes.data.forEach(row => {
          Object.keys(row).filter(k => k !== 'date').forEach(k => names.add(k));
        });
        setCourseNames([...names]);
      } catch (error) {
        console.error('Error fetching dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex">
        <Sidebar role="teacher" />
        <div className="flex-1 p-8"><p>Loading...</p></div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar role="teacher" />
      <div className="flex-1 p-8">
        <h1 className="text-4xl font-bold uppercase mb-8">TEACHER DASHBOARD</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="stat-card">
            <p className="stat-label">Total Students</p>
            <p className="stat-number">{dashboard?.totalStudents || 0}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Present Today</p>
            <p className="stat-number text-green-600">{dashboard?.presentToday || 0}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Absent Today</p>
            <p className="stat-number text-red-600">{dashboard?.absentToday || 0}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">At-Risk</p>
            <p className="stat-number text-yellow-600">{dashboard?.atRiskStudents || 0}</p>
          </div>
        </div>

        <div className="neo-card" style={{ backgroundColor: '#FFFDF5' }}>
          <h2 className="text-xl font-bold uppercase mb-6 border-b-2 border-black pb-3">
            📈 Attendance Trend — Last 7 Days
          </h2>
          {trends.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No attendance data for the last 7 days.</p>
          ) : (
            <div style={{ height: '350px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fontWeight: 'bold' }}
                    tickFormatter={(v) => new Date(v + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 12, fontWeight: 'bold' }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    formatter={(value) => [`${value}%`, undefined]}
                    labelFormatter={(label) => new Date(label + 'T00:00:00').toLocaleDateString()}
                    contentStyle={{ border: '2px solid black', boxShadow: '4px 4px 0px black', borderRadius: 0 }}
                  />
                  <Legend
                    wrapperStyle={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: 12 }}
                  />
                  {courseNames.map((name, i) => (
                    <Line
                      key={name}
                      type="monotone"
                      dataKey={name}
                      stroke={CHART_COLORS[i % CHART_COLORS.length]}
                      strokeWidth={3}
                      dot={{ r: 5, strokeWidth: 2 }}
                      activeDot={{ r: 7 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
