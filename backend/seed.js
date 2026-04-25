import bcryptjs from 'bcryptjs';
import { query } from './db.js';

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');

    // Create Departments
    await query(
      `INSERT INTO departments (name) VALUES 
       ('Computer Science'), 
       ('Electronics')
       ON CONFLICT DO NOTHING`
    );
    const depts = await query("SELECT id, name FROM departments ORDER BY id LIMIT 2");
    const deptIds = depts.rows.map(r => r.id);
    console.log('✅ Departments created');

    // Create Teachers
    const hashedPassword1 = await bcryptjs.hash('teacher1', 10);
    const hashedPassword2 = await bcryptjs.hash('teacher2', 10);
    await query(
      `INSERT INTO teachers (name, email, password_hash, department_id) VALUES 
       ($1, $2, $3, $4),
       ($5, $6, $7, $8)
       ON CONFLICT (email) DO NOTHING`,
      [
        'Dr. Alice Johnson', 'alice@school.edu', hashedPassword1, deptIds[0],
        'Prof. Bob Smith', 'bob@school.edu', hashedPassword2, deptIds[1],
      ]
    );
    const teachers = await query("SELECT id FROM teachers ORDER BY id LIMIT 2");
    const teacherIds = teachers.rows.map(r => r.id);
    console.log('✅ Teachers created');

    // Create Students (10 students)
    const studentData = [
      { name: 'Raj Kumar', roll_no: 'CS001', email: 'raj@student.edu', password: 'student1' },
      { name: 'Priya Singh', roll_no: 'CS002', email: 'priya@student.edu', password: 'student2' },
      { name: 'Arun Patel', roll_no: 'CS003', email: 'arun@student.edu', password: 'student3' },
      { name: 'Neha Gupta', roll_no: 'CS004', email: 'neha@student.edu', password: 'student4' },
      { name: 'Vikas Sharma', roll_no: 'CS005', email: 'vikas@student.edu', password: 'student5' },
      { name: 'Anjali Verma', roll_no: 'EC001', email: 'anjali@student.edu', password: 'student6' },
      { name: 'Rohit Nair', roll_no: 'EC002', email: 'rohit@student.edu', password: 'student7' },
      { name: 'Divya Reddy', roll_no: 'EC003', email: 'divya@student.edu', password: 'student8' },
      { name: 'Karan Singh', roll_no: 'EC004', email: 'karan@student.edu', password: 'student9' },
      { name: 'Sneha Iyer', roll_no: 'EC005', email: 'sneha@student.edu', password: 'student10' },
    ];

    const studentValues = [];
    const studentParams = [];
    let paramIndex = 1;
    for (let i = 0; i < studentData.length; i++) {
      const deptIndex = i < 5 ? 0 : 1;
      const hashed = await bcryptjs.hash(studentData[i].password, 10);
      studentValues.push(
        `($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, $${paramIndex + 4})`
      );
      studentParams.push(
        studentData[i].name,
        studentData[i].roll_no,
        studentData[i].email,
        hashed,
        deptIds[deptIndex]
      );
      paramIndex += 5;
    }
    await query(
      `INSERT INTO students (name, roll_no, email, password_hash, department_id) VALUES
       ${studentValues.join(',')}
       ON CONFLICT (email) DO NOTHING`,
      studentParams
    );
    const studentsDb = await query("SELECT id, department_id FROM students ORDER BY id LIMIT 10");
    const students = studentsDb.rows;
    console.log('✅ Students created');

    // Create Courses (4 courses)
    // First delete any existing data with foreign key constraints
    await query(`DELETE FROM attendance`);
    await query(`DELETE FROM qr_sessions`);
    await query(
      `DELETE FROM courses WHERE name IN (
        'Data Structures', 'Algorithms', 'Digital Electronics',
        'Database Management', 'Web Development', 'Software Engineering',
        'Data Analytics', 'Machine Learning', 'Network Security',
        'Circuit Design', 'Computer Architecture', 'Computer Graphics',
        'Environmental Studies'
      )`
    );
    
    await query(
      `INSERT INTO courses (name, teacher_id, department_id, classroom_latitude, classroom_longitude, allowed_radius_meters)
       VALUES 
       ($1, $2, $3, $4, $5, $6),
       ($7, $8, $9, $10, $11, $12),
       ($13, $14, $15, $16, $17, $18),
       ($19, $20, $21, $22, $23, $24)
       ON CONFLICT DO NOTHING`,
      [
        'Data Structures', teacherIds[0], deptIds[0], 28.6139, 77.2090, 50,
        'Computer Architecture', teacherIds[0], deptIds[0], 28.6145, 77.2095, 50,
        'Computer Graphics', teacherIds[0], deptIds[0], 28.6150, 77.2100, 50,
        'Environmental Studies', teacherIds[1], deptIds[1], 28.6139, 77.2100, 50,
      ]
    );
    const coursesDb = await query("SELECT id, name, department_id, teacher_id FROM courses ORDER BY id LIMIT 4");
    const courses = coursesDb.rows;
    console.log('✅ Courses created: ' + courses.map(c => c.name).join(', '));

    // Generate 30 days of attendance data for ALL courses
    console.log('📊 Generating 30 days of attendance data...');

    // Generate 30 days of attendance data for ALL courses
    console.log('📊 Generating 30 days of attendance data...');
    
    for (const course of courses) {
      // Get students in this course's department
      let courseStudents = students.filter(s => s.department_id === course.department_id);
      
      // If no students in department, assign all students
      if (courseStudents.length === 0) {
        courseStudents = students;
      }
      
      for (let day = 1; day <= 30; day++) {
        // Create a QR session for this day
        const sessionResult = await query(
          `INSERT INTO qr_sessions (course_id, generated_at, expires_at, is_active)
           VALUES ($1, CURRENT_DATE - ($2 || ' days')::INTERVAL, CURRENT_DATE - ($2 || ' days')::INTERVAL + INTERVAL '2 minutes', FALSE)
           RETURNING id`,
          [course.id, day]
        );
        const sessionId = sessionResult.rows[0].id;

        // Random present rate between 70-95% for this session
        const presentRate = 0.70 + Math.random() * 0.25;

        // Mark attendance for each student
        const attValues = [];
        const attParams = [];
        let attIdx = 1;
        for (const student of courseStudents) {
          const isPresent = Math.random() < presentRate;
          attValues.push(
            `($${attIdx}, $${attIdx + 1}, $${attIdx + 2}, $${attIdx + 3}, $${attIdx + 4}, $${attIdx + 5}, CURRENT_DATE - ($${attIdx + 6} || ' days')::INTERVAL)`
          );
          attParams.push(
            student.id,
            course.id,
            sessionId,
            28.6139 + (Math.random() * 0.0005 - 0.00025),
            77.2090 + (Math.random() * 0.0005 - 0.00025),
            isPresent,
            day
          );
          attIdx += 7;
        }

        if (attValues.length > 0) {
          await query(
            `INSERT INTO attendance (student_id, course_id, session_id, student_latitude, student_longitude, is_present, marked_at)
             VALUES ${attValues.join(',')}
             ON CONFLICT (student_id, session_id) DO NOTHING`,
            attParams
          );
        }
      }
      console.log(`  ✅ ${course.name}: 30 days × ${courseStudents.length} students`);
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📚 Sample Credentials:');
    console.log('Teacher: alice@school.edu / teacher1');
    console.log('Teacher: bob@school.edu / teacher2');
    console.log('Student: raj@student.edu / student1');
    console.log('Student: priya@student.edu / student2');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();
