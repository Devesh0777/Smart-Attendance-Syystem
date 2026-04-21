import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
import { query } from './db.js';
import { generateToken, authenticateTeacher, authenticateStudent } from './auth.js';
import { calculateDistance } from './distance.js';
import QRCode from 'qrcode';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ===================== AUTH ROUTES =====================

app.post('/api/auth/teacher/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    const result = await query('SELECT id, name, password_hash FROM teachers WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const teacher = result.rows[0];
    const passwordMatch = await bcryptjs.compare(password, teacher.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = generateToken(teacher.id, 'teacher', teacher.name);
    res.json({ token, userId: teacher.id, role: 'teacher', name: teacher.name });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/student/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    const result = await query('SELECT id, name, password_hash FROM students WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const student = result.rows[0];
    const passwordMatch = await bcryptjs.compare(password, student.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = generateToken(student.id, 'student', student.name);
    res.json({ token, userId: student.id, role: 'student', name: student.name });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/teacher/signup', async (req, res) => {
  try {
    const { name, email, password, department_id } = req.body;
    if (!name || !email || !password || !department_id) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    const existingTeacher = await query('SELECT id FROM teachers WHERE email = $1', [email]);
    const existingStudent = await query('SELECT id FROM students WHERE email = $1', [email]);
    if (existingTeacher.rows.length > 0 || existingStudent.rows.length > 0) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    const password_hash = await bcryptjs.hash(password, 10);
    const result = await query(
      'INSERT INTO teachers (name, email, password_hash, department_id) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, email, password_hash, department_id]
    );
    const token = generateToken(result.rows[0].id, 'teacher', name);
    res.json({ token, userId: result.rows[0].id, role: 'teacher', name });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/student/signup', async (req, res) => {
  try {
    const { name, roll_no, email, password, department_id } = req.body;
    if (!name || !roll_no || !email || !password || !department_id) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    const existingTeacher = await query('SELECT id FROM teachers WHERE email = $1', [email]);
    const existingStudent = await query('SELECT id FROM students WHERE email = $1', [email]);
    if (existingTeacher.rows.length > 0 || existingStudent.rows.length > 0) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    const existingRoll = await query('SELECT id FROM students WHERE roll_no = $1', [roll_no]);
    if (existingRoll.rows.length > 0) {
      return res.status(400).json({ error: 'Roll number already in use' });
    }
    const password_hash = await bcryptjs.hash(password, 10);
    const result = await query(
      'INSERT INTO students (name, roll_no, email, password_hash, department_id) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [name, roll_no, email, password_hash, department_id]
    );
    const token = generateToken(result.rows[0].id, 'student', name);
    res.json({ token, userId: result.rows[0].id, role: 'student', name });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/departments', async (req, res) => {
  try {
    const result = await query('SELECT id, name FROM departments ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===================== TEACHER ROUTES =====================

app.get('/api/teacher/profile', authenticateTeacher, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, name, email, department_id FROM teachers WHERE id = $1',
      [req.user.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/teacher/courses', authenticateTeacher, async (req, res) => {
  try {
    const result = await query(
      `SELECT c.id, c.name, c.classroom_latitude, c.classroom_longitude, 
              c.allowed_radius_meters, d.name as department_name
       FROM courses c
       LEFT JOIN departments d ON c.department_id = d.id
       WHERE c.teacher_id = $1`,
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/teacher/dashboard', authenticateTeacher, async (req, res) => {
  try {
    const totalStudentsResult = await query(
      `SELECT COUNT(DISTINCT s.id) as total
       FROM students s
       JOIN courses c ON s.department_id = c.department_id
       WHERE c.teacher_id = $1`,
      [req.user.userId]
    );
    const presentTodayResult = await query(
      `SELECT COUNT(DISTINCT a.student_id) as present
       FROM attendance a
       JOIN courses c ON a.course_id = c.id
       WHERE c.teacher_id = $1 AND DATE(a.marked_at) = CURRENT_DATE AND a.is_present = TRUE`,
      [req.user.userId]
    );
    const absentTodayResult = await query(
      `SELECT COUNT(DISTINCT a.student_id) as absent
       FROM attendance a
       JOIN courses c ON a.course_id = c.id
       WHERE c.teacher_id = $1 AND DATE(a.marked_at) = CURRENT_DATE AND a.is_present = FALSE`,
      [req.user.userId]
    );
    const atRiskResult = await query(
      `SELECT COUNT(*) as at_risk
       FROM attendance_summary
       WHERE course_id IN (SELECT id FROM courses WHERE teacher_id = $1)
       AND attendance_percentage < 75`,
      [req.user.userId]
    );
    const weeklyResult = await query(
      `SELECT 
         DATE(a.marked_at) as date,
         COUNT(CASE WHEN a.is_present THEN 1 END) as present,
         COUNT(CASE WHEN NOT a.is_present THEN 1 END) as absent
       FROM attendance a
       JOIN courses c ON a.course_id = c.id
       WHERE c.teacher_id = $1 AND a.marked_at >= CURRENT_DATE - INTERVAL '7 days'
       GROUP BY DATE(a.marked_at)
       ORDER BY date ASC`,
      [req.user.userId]
    );
    res.json({
      totalStudents: parseInt(totalStudentsResult.rows[0]?.total) || 0,
      presentToday: parseInt(presentTodayResult.rows[0]?.present) || 0,
      absentToday: parseInt(absentTodayResult.rows[0]?.absent) || 0,
      atRiskStudents: parseInt(atRiskResult.rows[0]?.at_risk) || 0,
      weeklyData: weeklyResult.rows,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/teacher/dashboard/trends', authenticateTeacher, async (req, res) => {
  try {
    const result = await query(
      `SELECT 
         DATE(a.marked_at) as date,
         c.name as course_name,
         ROUND(
           SUM(CASE WHEN a.is_present THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(a.id), 0),
           1
         ) as percentage
       FROM attendance a
       JOIN courses c ON a.course_id = c.id
       WHERE c.teacher_id = $1
         AND a.marked_at >= CURRENT_DATE - INTERVAL '7 days'
       GROUP BY DATE(a.marked_at), c.name
       ORDER BY DATE(a.marked_at)`,
      [req.user.userId]
    );
    const dateMap = {};
    result.rows.forEach(row => {
      const dateStr = new Date(row.date).toISOString().split('T')[0];
      if (!dateMap[dateStr]) dateMap[dateStr] = { date: dateStr };
      dateMap[dateStr][row.course_name] = parseFloat(row.percentage) || 0;
    });
    const trends = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
    res.json(trends);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/teacher/courses/:courseId/start-session', authenticateTeacher, async (req, res) => {
  try {
    const { courseId } = req.params;
    const courseResult = await query(
      'SELECT id FROM courses WHERE id = $1 AND teacher_id = $2',
      [courseId, req.user.userId]
    );
    if (courseResult.rows.length === 0) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const sessionResult = await query(
      `INSERT INTO qr_sessions (course_id, expires_at)
       VALUES ($1, NOW() + INTERVAL '2 minutes')
       RETURNING id, qr_token, expires_at`,
      [courseId]
    );
    const session = sessionResult.rows[0];
    const qrData = JSON.stringify({ token: session.qr_token, course_id: parseInt(courseId) });
    const qrDataUrl = await QRCode.toDataURL(qrData);
    res.json({
      sessionId: session.id,
      qrToken: session.qr_token,
      qrImage: qrDataUrl,
      expiresAt: session.expires_at,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/teacher/courses/:courseId/live-attendance', authenticateTeacher, async (req, res) => {
  try {
    const { courseId } = req.params;
    const courseResult = await query(
      'SELECT id, department_id FROM courses WHERE id = $1 AND teacher_id = $2',
      [courseId, req.user.userId]
    );
    if (courseResult.rows.length === 0) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const presentStudents = await query(
      `SELECT s.name, s.roll_no, a.marked_at
       FROM attendance a
       JOIN students s ON a.student_id = s.id
       JOIN qr_sessions qs ON a.session_id = qs.id
       WHERE qs.course_id = $1 AND qs.is_active = TRUE AND a.is_present = TRUE
       ORDER BY a.marked_at DESC`,
      [courseId]
    );
    const totalResult = await query(
      'SELECT COUNT(*) as total FROM students WHERE department_id = $1',
      [courseResult.rows[0].department_id]
    );
    res.json({
      presentCount: presentStudents.rows.length,
      totalStudents: parseInt(totalResult.rows[0].total) || 0,
      students: presentStudents.rows,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/teacher/courses/:courseId/students', authenticateTeacher, async (req, res) => {
  try {
    const { courseId } = req.params;
    const courseResult = await query(
      'SELECT department_id FROM courses WHERE id = $1 AND teacher_id = $2',
      [courseId, req.user.userId]
    );
    if (courseResult.rows.length === 0) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const students = await query(
      'SELECT id, name, roll_no FROM students WHERE department_id = $1 ORDER BY name',
      [courseResult.rows[0].department_id]
    );
    res.json(students.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/teacher/attendance', authenticateTeacher, async (req, res) => {
  try {
    const { course_id, date } = req.query;
    let query_text = `
      SELECT 
        a.id,
        s.name as student_name,
        s.roll_no,
        c.name as course_name,
        a.marked_at,
        a.is_present
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      JOIN courses c ON a.course_id = c.id
      WHERE c.teacher_id = $1
    `;
    const params = [req.user.userId];
    if (course_id) {
      query_text += ` AND a.course_id = $${params.length + 1}`;
      params.push(course_id);
    }
    if (date) {
      query_text += ` AND DATE(a.marked_at) = $${params.length + 1}`;
      params.push(date);
    }
    query_text += ' ORDER BY a.marked_at DESC';
    const result = await query(query_text, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/teacher/attendance/manual', authenticateTeacher, async (req, res) => {
  try {
    const { student_id, course_id, date, is_present } = req.body;
    if (!student_id || !course_id || !date || is_present === undefined) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const courseResult = await query(
      'SELECT id FROM courses WHERE id = $1 AND teacher_id = $2',
      [course_id, req.user.userId]
    );
    if (courseResult.rows.length === 0) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    let sessionResult = await query(
      'SELECT id FROM qr_sessions WHERE course_id = $1 AND DATE(generated_at) = $2 LIMIT 1',
      [course_id, date]
    );
    let sessionId;
    if (sessionResult.rows.length === 0) {
      const newSession = await query(
        `INSERT INTO qr_sessions (course_id, generated_at, expires_at, is_active)
         VALUES ($1, $2::date, $2::date + INTERVAL '2 minutes', FALSE)
         RETURNING id`,
        [course_id, date]
      );
      sessionId = newSession.rows[0].id;
    } else {
      sessionId = sessionResult.rows[0].id;
    }
    await query(
      `INSERT INTO attendance (student_id, course_id, session_id, is_present, marked_at)
       VALUES ($1, $2, $3, $4, $5::date)
       ON CONFLICT (student_id, session_id) DO UPDATE SET is_present = $4`,
      [student_id, course_id, sessionId, is_present, date]
    );
    res.json({ success: true, message: 'Attendance updated successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/teacher/at-risk', authenticateTeacher, async (req, res) => {
  try {
    const result = await query(
      `SELECT 
         student_id,
         student_name,
         roll_no,
         course_name,
         attendance_percentage,
         present_count,
         total_classes
       FROM attendance_summary
       WHERE course_id IN (SELECT id FROM courses WHERE teacher_id = $1)
       AND attendance_percentage < 75
       ORDER BY attendance_percentage ASC`,
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===================== STUDENT ROUTES =====================

app.get('/api/student/profile', authenticateStudent, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, name, email, roll_no, department_id FROM students WHERE id = $1',
      [req.user.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/student/dashboard', authenticateStudent, async (req, res) => {
  try {
    const result = await query(
      `SELECT 
         course_id,
         course_name,
         attendance_percentage,
         present_count,
         total_classes
       FROM attendance_summary
       WHERE student_id = $1
       ORDER BY course_name ASC`,
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/student/dashboard/graphs', authenticateStudent, async (req, res) => {
  try {
    // Overall percentage
    const overallResult = await query(
      `SELECT 
         ROUND(
           SUM(CASE WHEN a.is_present THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(a.id), 0),
           1
         ) as overall_percentage
       FROM attendance a
       WHERE a.student_id = $1`,
      [req.user.userId]
    );
    // Per course stats
    const coursesResult = await query(
      `SELECT 
         c.id as course_id,
         c.name as course_name,
         COUNT(a.id) as total_classes,
         SUM(CASE WHEN a.is_present THEN 1 ELSE 0 END) as attended,
         ROUND(
           SUM(CASE WHEN a.is_present THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(a.id), 0),
           1
         ) as percentage
       FROM attendance a
       JOIN courses c ON a.course_id = c.id
       WHERE a.student_id = $1
       GROUP BY c.id, c.name
       ORDER BY c.name`,
      [req.user.userId]
    );
    // Weekly trend (last 28 days, bucketed into 4 weeks)
    const weeklyResult = await query(
      `SELECT 
         c.id as course_id,
         a.marked_at,
         a.is_present
       FROM attendance a
       JOIN courses c ON a.course_id = c.id
       WHERE a.student_id = $1
         AND a.marked_at >= CURRENT_DATE - INTERVAL '28 days'
       ORDER BY a.marked_at`,
      [req.user.userId]
    );
    // Bucket into weeks per course
    const now = new Date();
    const weeklyMap = {};
    weeklyResult.rows.forEach(row => {
      const courseId = row.course_id;
      if (!weeklyMap[courseId]) weeklyMap[courseId] = { 0: { total: 0, present: 0 }, 1: { total: 0, present: 0 }, 2: { total: 0, present: 0 }, 3: { total: 0, present: 0 } };
      const daysAgo = Math.floor((now - new Date(row.marked_at)) / (1000 * 60 * 60 * 24));
      const weekIdx = Math.min(Math.floor(daysAgo / 7), 3);
      weeklyMap[courseId][weekIdx].total++;
      if (row.is_present) weeklyMap[courseId][weekIdx].present++;
    });
    const courses = coursesResult.rows.map(course => {
      const weeks = weeklyMap[course.course_id] || {};
      const weekly_trend = [3, 2, 1, 0].map((w, i) => ({
        week: `Week ${i + 1}`,
        percentage: weeks[w] && weeks[w].total > 0
          ? Math.round(weeks[w].present * 100 / weeks[w].total)
          : 0
      }));
      return {
        course_id: course.course_id,
        course_name: course.course_name,
        total_classes: parseInt(course.total_classes),
        attended: parseInt(course.attended),
        percentage: parseFloat(course.percentage) || 0,
        weekly_trend,
      };
    });
    res.json({
      overall_percentage: parseFloat(overallResult.rows[0]?.overall_percentage) || 0,
      courses,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/student/mark-attendance', authenticateStudent, async (req, res) => {
  try {
    const { qrToken, course_id, latitude, longitude } = req.body;
    if (!qrToken || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'QR token and GPS coordinates required' });
    }
    const sessionResult = await query(
      `SELECT qs.id, qs.course_id, qs.expires_at, qs.is_active
       FROM qr_sessions qs
       WHERE qs.qr_token = $1 AND qs.is_active = TRUE AND qs.expires_at > NOW()`,
      [qrToken]
    );
    if (sessionResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired QR code' });
    }
    const session = sessionResult.rows[0];
    const courseResult = await query(
      'SELECT classroom_latitude, classroom_longitude, allowed_radius_meters FROM courses WHERE id = $1',
      [session.course_id]
    );
    if (courseResult.rows.length === 0) {
      return res.status(400).json({ error: 'Course not found' });
    }
    const course = courseResult.rows[0];
    const distance = calculateDistance(
      parseFloat(latitude),
      parseFloat(longitude),
      parseFloat(course.classroom_latitude),
      parseFloat(course.classroom_longitude)
    );
    if (distance > course.allowed_radius_meters) {
      return res.status(400).json({
        error: `You are not in the classroom. Distance: ${Math.round(distance)}m, Allowed: ${course.allowed_radius_meters}m`,
      });
    }
    const insertResult = await query(
      `INSERT INTO attendance (student_id, course_id, session_id, student_latitude, student_longitude, is_present)
       VALUES ($1, $2, $3, $4, $5, TRUE)
       ON CONFLICT (student_id, session_id) DO NOTHING
       RETURNING id`,
      [req.user.userId, session.course_id, session.id, latitude, longitude]
    );
    if (insertResult.rows.length === 0) {
      return res.status(400).json({ error: 'Attendance already marked' });
    }
    res.json({
      success: true,
      message: 'Attendance marked successfully',
      attendanceId: insertResult.rows[0].id,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/student/attendance-history', authenticateStudent, async (req, res) => {
  try {
    const { courseId } = req.query;
    let query_text = `
      SELECT 
        a.id,
        c.name as course_name,
        c.id as course_id,
        a.marked_at,
        a.is_present
      FROM attendance a
      JOIN courses c ON a.course_id = c.id
      WHERE a.student_id = $1
    `;
    const params = [req.user.userId];
    if (courseId) {
      query_text += ` AND a.course_id = $${params.length + 1}`;
      params.push(courseId);
    }
    query_text += ' ORDER BY a.marked_at DESC';
    const result = await query(query_text, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===================== HEALTH CHECK =====================

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
