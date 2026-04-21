import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';
import { useToast, Toast } from '../../components/Toast';

export default function StartClass() {
  const { courseId } = useParams();
  const [qrSession, setQrSession] = useState(null);
  const [liveAttendance, setLiveAttendance] = useState({ presentCount: 0, totalStudents: 0, students: [] });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const { showToast, toasts } = useToast();

  useEffect(() => {
    let refreshInterval;
    const startSession = async () => {
      try {
        const response = await api.post(`/teacher/courses/${courseId}/start-session`);
        setQrSession(response.data);
        setLoading(false);
        showToast('QR Session started!', 'success');

        refreshInterval = setInterval(() => {
          api.post(`/teacher/courses/${courseId}/start-session`)
            .then((res) => {
              setQrSession(res.data);
              showToast('QR Code refreshed', 'success');
            })
            .catch((err) => console.error('Error refreshing QR:', err));
        }, 90000);
      } catch (error) {
        showToast('Failed to start class', 'error');
        setLoading(false);
      }
    };

    startSession();
    return () => { if (refreshInterval) clearInterval(refreshInterval); };
  }, [courseId]);

  useEffect(() => {
    if (!qrSession) return;

    const fetchLiveAttendance = async () => {
      try {
        const response = await api.get(`/teacher/courses/${courseId}/live-attendance`);
        setLiveAttendance(response.data);
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Error fetching live attendance:', error);
      }
    };

    fetchLiveAttendance();
    const interval = setInterval(fetchLiveAttendance, 5000);
    return () => clearInterval(interval);
  }, [courseId, qrSession]);

  if (loading) {
    return (
      <div className="flex">
        <Sidebar role="teacher" />
        <div className="flex-1 p-8">
          <p>Starting class...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar role="teacher" />
      <Toast toasts={toasts} />
      <div className="flex-1 p-8">
        <h1 className="text-4xl font-bold uppercase mb-8">Start Class - Live QR</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="neo-card flex flex-col items-center justify-center p-10 bg-white">
              {qrSession?.qrImage && (
                <img
                  src={qrSession.qrImage}
                  alt="QR Code"
                  className="border-4 border-black mb-4"
                  style={{ width: '300px', height: '300px' }}
                />
              )}
              <p className="text-xs font-bold uppercase mt-4 text-gray-600">Scan this QR to mark attendance</p>
              <p className="text-xs mt-2 text-gray-500">Expires: {new Date(qrSession?.expiresAt).toLocaleTimeString()}</p>
              <p className="text-xs mt-2 text-gray-500">Auto-refresh every 90 seconds</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Counter Card */}
            <div className="neo-card">
              <p className="text-xs font-bold uppercase mb-4 border-b-2 border-black pb-2">Live Attendance 🔄</p>
              <div className="text-center">
                <p className="text-5xl font-bold text-green-600">
                  {liveAttendance.presentCount} / {liveAttendance.totalStudents}
                </p>
                <p className="text-sm font-bold uppercase text-gray-600 mt-2">Students Present</p>
              </div>
              <p className="text-xs text-gray-500 mt-4 text-center">
                {lastUpdate ? `Last updated: ${lastUpdate.toLocaleTimeString()}` : 'Loading...'}
              </p>
              <p className="text-xs text-gray-400 mt-1 text-center">Updates every 5 seconds</p>
            </div>

            {/* Student List Card */}
            <div className="neo-card">
              <p className="text-xs font-bold uppercase mb-3 border-b-2 border-black pb-2">
                Students Marked Present ({liveAttendance.students?.length || 0})
              </p>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {(!liveAttendance.students || liveAttendance.students.length === 0) ? (
                  <p className="text-xs text-gray-500 text-center py-4">No students yet...</p>
                ) : (
                  liveAttendance.students.map((s, i) => (
                    <div key={i} className="flex items-center justify-between py-2 px-3 border-b border-gray-200">
                      <div>
                        <p className="text-sm font-bold">{s.name}</p>
                        <p className="text-xs text-gray-500">{s.roll_no}</p>
                      </div>
                      <span className="text-xs bg-green-400 text-white px-2 py-1 font-bold uppercase">
                        ✓ Present
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
