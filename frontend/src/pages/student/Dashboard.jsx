import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const getColor = (pct) => {
  if (pct >= 75) return '#22c55e';
  if (pct >= 60) return '#eab308';
  return '#ef4444';
};

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/student/dashboard/graphs');
        setData(response.data);
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
        <Sidebar role="student" />
        <div className="flex-1 p-8"><p>Loading...</p></div>
      </div>
    );
  }

  const overallPct = data?.overall_percentage || 0;
  const overallColor = getColor(overallPct);
  const pieData = [
    { name: 'Present', value: overallPct },
    { name: 'Absent', value: 100 - overallPct },
  ];

  return (
    <div className="flex">
      <Sidebar role="student" />
      <div className="flex-1 p-8">
        <h1 className="text-4xl font-bold uppercase mb-8">Your Attendance</h1>

        {/* Section 1: Overall Attendance */}
        <div className="neo-card mb-8" style={{ backgroundColor: '#FFFDF5' }}>
          <h2 className="text-xl font-bold uppercase mb-4 border-b-2 border-black pb-3">
            📊 Overall Attendance
          </h2>
          <div className="flex items-center justify-center">
            <div className="relative">
              <ResponsiveContainer width={220} height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    stroke="black"
                    strokeWidth={2}
                  >
                    <Cell fill={overallColor} />
                    <Cell fill="#e5e7eb" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-4xl font-bold" style={{ color: overallColor }}>
                    {overallPct.toFixed(1)}%
                  </p>
                  <p className="text-xs font-bold uppercase text-gray-500 mt-1">Overall</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Per Subject Attendance */}
        <h2 className="text-2xl font-bold uppercase mb-6">Per Subject Attendance</h2>

        {(!data?.courses || data.courses.length === 0) ? (
          <div className="neo-card">
            <p className="text-center py-8">No courses enrolled yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.courses.map((course) => {
              const color = getColor(course.percentage);
              return (
                <div key={course.course_id} className="neo-card">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold uppercase">{course.course_name}</h3>
                    {course.percentage < 75 && (
                      <span className="px-2 py-1 text-xs font-bold uppercase text-white bg-red-500 border-2 border-black">
                        ⚠️ At Risk
                      </span>
                    )}
                  </div>

                  <div className="mb-4" style={{ height: '160px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={course.weekly_trend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                        <XAxis dataKey="week" tick={{ fontSize: 11, fontWeight: 'bold' }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                        <Tooltip
                          formatter={(value) => [`${value}%`, 'Attendance']}
                          contentStyle={{ border: '2px solid black', boxShadow: '4px 4px 0px black', borderRadius: 0 }}
                        />
                        <Bar dataKey="percentage" fill={color} stroke="black" strokeWidth={1} radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="border-t-2 border-black pt-3 flex items-center justify-between">
                    <p className="text-sm">
                      <span className="font-bold">{course.attended}</span> classes attended out of <span className="font-bold">{course.total_classes}</span> total
                    </p>
                    <p className="text-2xl font-bold" style={{ color }}>{course.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
