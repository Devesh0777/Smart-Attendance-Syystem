import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';

export default function TeacherCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const response = await api.get('/teacher/courses');
        setCourses(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setError(error.message || 'Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="flex">
        <Sidebar role="teacher" />
        <div className="flex-1 p-8">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex">
        <Sidebar role="teacher" />
        <div className="flex-1 p-8">
          <div className="neo-card border-red-600">
            <p className="text-red-600 font-bold">Error: {error}</p>
            <p className="text-sm text-gray-600 mt-2">Check browser console for more details</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar role="teacher" />
      <div className="flex-1 p-8">
        <h1 className="text-4xl font-bold uppercase mb-8">My Courses</h1>

        {courses.length === 0 ? (
          <div className="neo-card">
            <p className="text-center py-8">No courses assigned yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="neo-card">
                <h3 className="text-xl font-bold uppercase mb-3">{course.name}</h3>
                <p className="text-sm mb-2">📚 {course.department_name}</p>
                <p className="text-sm mb-4">📍 {parseFloat(course.classroom_latitude).toFixed(4)}, {parseFloat(course.classroom_longitude).toFixed(4)}</p>
                <p className="text-sm mb-4">🚩 Radius: {course.allowed_radius_meters}m</p>
                
                <Link to={`/teacher/courses/${course.id}/start-class`}>
                  <button className="neo-button primary w-full">
                    START CLASS
                  </button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
