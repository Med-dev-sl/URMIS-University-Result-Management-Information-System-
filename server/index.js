import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import { getAll, getOne, initializeDatabase, runSql } from './db.js'
import healthRoutes from './routes/health.js'
import studentsRoutes from './routes/students.js'
import resultsRoutes from './routes/results.js'
import coursesRoutes from './routes/courses.js'
import facultiesRoutes from './routes/faculties.js'
import modulesRoutes from './routes/modules.js'

dotenv.config()

const app = express()
const port = Number(process.env.PORT || 5000)

const seedDemoData = async () => {
  const institutionCount = await getOne('SELECT COUNT(*) AS count FROM institutions')

  if (institutionCount.count > 0) {
    return
  }

  const institution = await runSql(
    'INSERT INTO institutions (name, address, contact_email) VALUES (?, ?, ?)',
    ['Greenfield University', '12 Learning Avenue, Lagos', 'admin@greenfield.edu'],
  )

  await runSql(
    'INSERT INTO users (institution_id, full_name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
    [institution.id, 'Aisha Bello', 'admin@greenfield.edu', 'demo-password-hash', 'admin'],
  )

  const faculties = [
    { name: 'Science & Technology' },
    { name: 'Business & Management' },
  ]

  const facultyIds = []

  for (const faculty of faculties) {
    const result = await runSql(
      'INSERT INTO faculties (institution_id, name) VALUES (?, ?)',
      [institution.id, faculty.name],
    )
    facultyIds.push(result.id)
  }

  const departments = [
    { name: 'Computer Science', faculty_id: facultyIds[0] },
    { name: 'Business Administration', faculty_id: facultyIds[1] },
  ]

  const departmentIds = []

  for (const department of departments) {
    const result = await runSql(
      'INSERT INTO departments (institution_id, faculty_id, name) VALUES (?, ?, ?)',
      [institution.id, department.faculty_id, department.name],
    )
    departmentIds.push(result.id)
  }

  const students = [
    { student_id: 'CS-2024-001', full_name: 'Daniel Adebayo', department_id: departmentIds[0], semester: '400 Level', enrollment_year: '2024' },
    { student_id: 'CS-2024-002', full_name: 'Grace Okafor', department_id: departmentIds[0], semester: '400 Level', enrollment_year: '2024' },
    { student_id: 'CS-2024-003', full_name: 'Emmanuel Nwosu', department_id: departmentIds[0], semester: '300 Level', enrollment_year: '2023' },
    { student_id: 'BA-2024-001', full_name: 'Fatima Yusuf', department_id: departmentIds[1], semester: '200 Level', enrollment_year: '2024' },
    { student_id: 'BA-2024-002', full_name: 'Michael Johnson', department_id: departmentIds[1], semester: '200 Level', enrollment_year: '2024' },
  ]

  const studentIds = []

  for (const student of students) {
    const result = await runSql(
      'INSERT INTO students (institution_id, student_id, full_name, department_id, semester, enrollment_year) VALUES (?, ?, ?, ?, ?, ?)',
      [institution.id, student.student_id, student.full_name, student.department_id, student.semester, student.enrollment_year],
    )
    studentIds.push(result.id)
  }

  const courses = [
    { course_code: 'CSC401', course_name: 'Software Engineering', credit_hours: 3, department_id: departmentIds[0] },
    { course_code: 'CSC402', course_name: 'Database Systems', credit_hours: 3, department_id: departmentIds[0] },
    { course_code: 'MGT301', course_name: 'Strategic Management', credit_hours: 2, department_id: departmentIds[1] },
    { course_code: 'MGT302', course_name: 'Financial Reporting', credit_hours: 3, department_id: departmentIds[1] },
  ]

  const courseIds = []

  for (const course of courses) {
    const result = await runSql(
      'INSERT INTO courses (institution_id, department_id, course_code, course_name, credit_hours) VALUES (?, ?, ?, ?, ?)',
      [institution.id, course.department_id, course.course_code, course.course_name, course.credit_hours],
    )
    courseIds.push(result.id)
  }

  const modules = [
    { course_index: 0, module_code: 'CSC401-1', module_name: 'Requirements Engineering' },
    { course_index: 0, module_code: 'CSC401-2', module_name: 'Software Design Patterns' },
    { course_index: 1, module_code: 'CSC402-1', module_name: 'Relational Database Design' },
    { course_index: 1, module_code: 'CSC402-2', module_name: 'SQL Performance' },
    { course_index: 2, module_code: 'MGT301-1', module_name: 'Strategic Analysis' },
    { course_index: 2, module_code: 'MGT301-2', module_name: 'Corporate Strategy' },
    { course_index: 3, module_code: 'MGT302-1', module_name: 'Financial Statements' },
    { course_index: 3, module_code: 'MGT302-2', module_name: 'Budgeting & Forecasting' },
  ]

  for (const module of modules) {
    await runSql(
      'INSERT INTO modules (institution_id, course_id, module_code, module_name, credit_hours, description) VALUES (?, ?, ?, ?, ?, ?)',
      [institution.id, courseIds[module.course_index], module.module_code, module.module_name, 1, `${module.module_name} description`],
    )
  }

  const resultSeed = [
    { student_id: studentIds[0], course_id: courseIds[0], assignment_score: 88, exam_score: 91, percentage: 90, grade: 'A', pass_fail: 'PASS' },
    { student_id: studentIds[1], course_id: courseIds[1], assignment_score: 76, exam_score: 81, percentage: 79, grade: 'C', pass_fail: 'PASS' },
    { student_id: studentIds[2], course_id: courseIds[0], assignment_score: 64, exam_score: 72, percentage: 68, grade: 'D', pass_fail: 'PASS' },
    { student_id: studentIds[3], course_id: courseIds[2], assignment_score: 80, exam_score: 84, percentage: 82, grade: 'B', pass_fail: 'PASS' },
    { student_id: studentIds[4], course_id: courseIds[3], assignment_score: 58, exam_score: 66, percentage: 62, grade: 'D', pass_fail: 'PASS' },
  ]

  for (const result of resultSeed) {
    await runSql(
      'INSERT INTO results (institution_id, student_id, course_id, assignment_score, exam_score, total_score, percentage, grade, pass_fail, academic_session) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [institution.id, result.student_id, result.course_id, result.assignment_score, result.exam_score, result.assignment_score + result.exam_score, result.percentage, result.grade, result.pass_fail, '2024/2025'],
    )
  }
}

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN?.split(',') || true,
    credentials: true,
  }),
)
app.use(express.json())

app.get('/api', (req, res) => {
  res.json({
    app: 'URMIS API',
    version: '1.0.0',
    status: 'running',
  })
})

app.use('/api/health', healthRoutes)
app.use('/api/students', studentsRoutes)
app.use('/api/results', resultsRoutes)
app.use('/api/courses', coursesRoutes)
app.use('/api/faculties', facultiesRoutes)
app.use('/api/modules', modulesRoutes)

app.get('/api/dashboard', async (req, res) => {
  try {
    const totalStudents = await getOne('SELECT COUNT(*) AS count FROM students')
    const totalCourses = await getOne('SELECT COUNT(*) AS count FROM courses')
    const totalResults = await getOne('SELECT COUNT(*) AS count FROM results')
    const avgPerformance = await getOne('SELECT AVG(percentage) AS average FROM results')

    const students = await getAll(`
      SELECT s.id, s.student_id, s.full_name, s.semester, d.name AS department_name
      FROM students s
      LEFT JOIN departments d ON d.id = s.department_id
      ORDER BY s.id DESC
      LIMIT 5
    `)

    const recentResults = await getAll(`
      SELECT r.id, r.percentage, r.grade, s.full_name AS student_name, c.course_name
      FROM results r
      JOIN students s ON s.id = r.student_id
      JOIN courses c ON c.id = r.course_id
      ORDER BY r.id DESC
      LIMIT 5
    `)

    res.json({
      stats: [
        { label: 'Students', value: totalStudents.count, trend: '+8.2%' },
        { label: 'Courses', value: totalCourses.count, trend: '+4.1%' },
        { label: 'Results', value: totalResults.count, trend: '+12.4%' },
        { label: 'Avg', value: `${Math.round(avgPerformance.average || 0)}%`, trend: '+2.6%' },
      ],
      students,
      recentResults,
    })
  } catch (error) {
    console.error('Dashboard query failed:', error)
    res.status(500).json({ message: 'Dashboard data could not be loaded.' })
  }
})

initializeDatabase()
  .then(async () => {
    await seedDemoData()

    app.listen(port, () => {
      console.log(`URMIS API running on http://localhost:${port}`)
    })
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error)
    process.exit(1)
  })

export default app
