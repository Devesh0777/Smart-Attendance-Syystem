import dotenv from 'dotenv';
import pkg from 'pg';
const { Pool } = pkg;

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const schema = `
  CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
  );

  CREATE TABLE IF NOT EXISTS teachers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    department_id INT REFERENCES departments(id)
  );

  CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    roll_no VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    department_id INT REFERENCES departments(id)
  );

  CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    teacher_id INT REFERENCES teachers(id),
    department_id INT REFERENCES departments(id),
    classroom_latitude DECIMAL(9,6) NOT NULL,
    classroom_longitude DECIMAL(9,6) NOT NULL,
    allowed_radius_meters INT DEFAULT 50
  );

  CREATE TABLE IF NOT EXISTS qr_sessions (
    id SERIAL PRIMARY KEY,
    course_id INT REFERENCES courses(id),
    qr_token UUID DEFAULT gen_random_uuid(),
    generated_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '2 minutes',
    is_active BOOLEAN DEFAULT TRUE
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(id),
    course_id INT REFERENCES courses(id),
    session_id INT REFERENCES qr_sessions(id),
    marked_at TIMESTAMP DEFAULT NOW(),
    student_latitude DECIMAL(9,6),
    student_longitude DECIMAL(9,6),
    is_present BOOLEAN DEFAULT FALSE,
    UNIQUE(student_id, session_id)
  );

  CREATE OR REPLACE VIEW attendance_summary AS
  SELECT 
    s.id as student_id,
    s.name as student_name,
    s.roll_no,
    c.id as course_id,
    c.name as course_name,
    COUNT(a.id) as total_classes,
    SUM(CASE WHEN a.is_present THEN 1 ELSE 0 END) as present_count,
    ROUND(SUM(CASE WHEN a.is_present THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(a.id), 0), 2) as attendance_percentage
  FROM students s
  JOIN attendance a ON s.id = a.student_id
  JOIN courses c ON a.course_id = c.id
  GROUP BY s.id, s.name, s.roll_no, c.id, c.name;

  CREATE OR REPLACE FUNCTION deactivate_old_sessions()
  RETURNS TRIGGER AS $$
  BEGIN
    UPDATE qr_sessions 
    SET is_active = FALSE 
    WHERE course_id = NEW.course_id AND id != NEW.id;
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  DROP TRIGGER IF EXISTS trg_deactivate_old_sessions ON qr_sessions;
  CREATE TRIGGER trg_deactivate_old_sessions
  AFTER INSERT ON qr_sessions
  FOR EACH ROW EXECUTE FUNCTION deactivate_old_sessions();
`;

async function initializeDatabase() {
  const client = await pool.connect();
  try {
    console.log('Initializing database...');
    await client.query(schema);
    console.log('✅ Database schema initialized successfully!');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  } finally {
    client.release();
    pool.end();
  }
}

initializeDatabase();
