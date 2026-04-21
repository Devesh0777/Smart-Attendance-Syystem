import React, { useState, useRef, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';
import { useToast, Toast } from '../../components/Toast';
import Html5QrcodePlugin from '../../components/Html5QrcodePlugin';

export default function ScanAttendance() {
  const [qrToken, setQrToken] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast, toasts } = useToast();
  const [cameraActive, setCameraActive] = useState(false);

  const handleQRScan = async (decodedText) => {
    if (loading) return;
    setLoading(true);
    setCameraActive(false);

    try {
      // Get current location
      if (!navigator.geolocation) {
        showToast('Geolocation not supported', 'error');
        setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            let qrToken = decodedText;
            let courseId = null;
            try {
              const parsed = JSON.parse(decodedText);
              qrToken = parsed.token;
              courseId = parsed.course_id;
            } catch (e) {
              // fallback: treat as raw token
            }
            const response = await api.post('/student/mark-attendance', {
              qrToken,
              course_id: courseId,
              latitude,
              longitude,
            });

            showToast('✓ Attendance marked successfully!', 'success');
            setQrToken('');
          } catch (error) {
            showToast(error.response?.data?.error || 'Failed to mark attendance', 'error');
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          showToast('Error getting location. Please enable GPS.', 'error');
          setLoading(false);
        }
      );
    } catch (error) {
      showToast('Error scanning QR code', 'error');
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar role="student" />
      <Toast toasts={toasts} />
      <div className="flex-1 p-8">
        <h1 className="text-4xl font-bold uppercase mb-8">Mark Attendance</h1>

        <div className="max-w-2xl">
          <div className="neo-card mb-6">
            <h2 className="text-xl font-bold uppercase mb-4 border-b-2 border-black pb-2">📱 Scan QR Code</h2>

            {cameraActive ? (
              <div>
                <Html5QrcodePlugin
                  fps={10}
                  qrbox={250}
                  disableFlip={false}
                  qrCodeSuccessCallback={handleQRScan}
                  qrCodeErrorCallback={() => {}}
                />
                <button
                  onClick={() => setCameraActive(false)}
                  className="neo-button secondary w-full mt-4"
                >
                  Stop Camera
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCameraActive(true)}
                className="neo-button primary w-full py-6 text-lg"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Open Camera'}
              </button>
            )}
          </div>

          <div className="neo-card">
            <h3 className="text-lg font-bold uppercase mb-3 border-b-2 border-black pb-2">Instructions</h3>
            <ul className="space-y-2 text-sm">
              <li>✓ Click "Open Camera" button</li>
              <li>✓ Point camera at the QR code displayed by teacher</li>
              <li>✓ App will automatically detect your location</li>
              <li>✓ Attendance will be marked if you're within classroom radius</li>
              <li>✓ You'll see success or error message</li>
            </ul>
          </div>

          <div className="mt-6 neo-card bg-yellow-50 border-4 border-yellow-400">
            <p className="font-bold uppercase mb-2">⚠ Important</p>
            <p className="text-sm">
              Make sure location services (GPS) are enabled on your device. You must be within the allowed distance from the classroom.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
