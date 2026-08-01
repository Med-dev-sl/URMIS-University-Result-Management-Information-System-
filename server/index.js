import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'

import bcrypt from 'bcryptjs'
import prisma from './prisma-runtime.js'
import healthRoutes from './routes/health.js'
import studentsRoutes from './routes/students.js'
import resultsRoutes from './routes/results.js'
import coursesRoutes from './routes/courses/courses.js'
import departmentsRoutes from './routes/institution/departments.js'
import facultiesRoutes from './routes/institution/faculties.js'
import institutionRoutes from './routes/institution/index.js'
import modulesRoutes from './routes/courses/modules.js'
import platformRoutes from './routes/platform/index.js'
import authRoutes from './routes/auth/index.js'
import registrationRoutes from './routes/registration/index.js'
import staffRoutes from './routes/staff/index.js'
import assessmentsRoutes from './routes/assessments/index.js'
import examinationRoutes from './routes/examination/index.js'
import approvalRoutes from './routes/approval/index.js'
import documentsRoutes from './routes/documents/index.js'
import usersRoutes from './routes/users.js'
import academicsRoutes from './routes/academics.js'
import reportsRoutes from './routes/reports/index.js'
import communicationRoutes from './routes/communication/index.js'
import settingsRoutes from './routes/settings/index.js'
import rolesRoutes from './routes/roles/index.js'
import { auditLogger } from './shared/security/auditMiddleware.js'

dotenv.config()

const app = express()
const port = Number(process.env.PORT || 5000)

const seedDemoData = async () => {
  const institutionCount = await prisma.institution.count()

  if (institutionCount > 0) {
    return
  }

  const institution = await prisma.institution.create({
    data: {
      name: 'Greenfield University',
      address: '12 Learning Avenue, Lagos',
      contact_email: 'admin@greenfield.edu',
      users: {
        create: {
          full_name: 'Aisha Bello',
          email: 'admin@greenfield.edu',
          password_hash: await bcrypt.hash('Admin@123', 10),
          role: 'admin',
          updated_at: new Date(),
        },
      },
    },
  })

  const scienceFaculty = await prisma.faculty.create({
    data: {
      institutionId: institution.id,
      name: 'Science & Technology',
    },
  })

  const businessFaculty = await prisma.faculty.create({
    data: {
      institutionId: institution.id,
      name: 'Business & Management',
    },
  })

  const computerScienceDepartment = await prisma.department.create({
    data: {
      institutionId: institution.id,
      facultyId: scienceFaculty.id,
      name: 'Computer Science',
    },
  })

  const businessAdminDepartment = await prisma.department.create({
    data: {
      institutionId: institution.id,
      facultyId: businessFaculty.id,
      name: 'Business Administration',
    },
  })

  const studentRecordsData = [
    { institutionId: institution.id, departmentId: computerScienceDepartment.id, student_id: 'CS-2024-001', full_name: 'Daniel Adebayo', semester: '400 Level', enrollment_year: '2024' },
    { institutionId: institution.id, departmentId: computerScienceDepartment.id, student_id: 'CS-2024-002', full_name: 'Grace Okafor', semester: '400 Level', enrollment_year: '2024' },
    { institutionId: institution.id, departmentId: computerScienceDepartment.id, student_id: 'CS-2024-003', full_name: 'Emmanuel Nwosu', semester: '300 Level', enrollment_year: '2023' },
    { institutionId: institution.id, departmentId: businessAdminDepartment.id, student_id: 'BA-2024-001', full_name: 'Fatima Yusuf', semester: '200 Level', enrollment_year: '2024' },
    { institutionId: institution.id, departmentId: businessAdminDepartment.id, student_id: 'BA-2024-002', full_name: 'Michael Johnson', semester: '200 Level', enrollment_year: '2024' },
  ]

  const studentRecords = await Promise.all(studentRecordsData.map((student) => prisma.student.create({ data: student })))

  const courseData = [
    { institutionId: institution.id, departmentId: computerScienceDepartment.id, course_code: 'CSC401', course_name: 'Software Engineering', credit_hours: 3 },
    { institutionId: institution.id, departmentId: computerScienceDepartment.id, course_code: 'CSC402', course_name: 'Database Systems', credit_hours: 3 },
    { institutionId: institution.id, departmentId: businessAdminDepartment.id, course_code: 'MGT301', course_name: 'Strategic Management', credit_hours: 2 },
    { institutionId: institution.id, departmentId: businessAdminDepartment.id, course_code: 'MGT302', course_name: 'Financial Reporting', credit_hours: 3 },
  ]

  const savedCourses = await Promise.all(courseData.map((course) => prisma.course.create({ data: course })))

  const moduleData = [
    { course_index: 0, module_code: 'CSC401-1', module_name: 'Requirements Engineering' },
    { course_index: 0, module_code: 'CSC401-2', module_name: 'Software Design Patterns' },
    { course_index: 1, module_code: 'CSC402-1', module_name: 'Relational Database Design' },
    { course_index: 1, module_code: 'CSC402-2', module_name: 'SQL Performance' },
    { course_index: 2, module_code: 'MGT301-1', module_name: 'Strategic Analysis' },
    { course_index: 2, module_code: 'MGT301-2', module_name: 'Corporate Strategy' },
    { course_index: 3, module_code: 'MGT302-1', module_name: 'Financial Statements' },
    { course_index: 3, module_code: 'MGT302-2', module_name: 'Budgeting & Forecasting' },
  ]

  await Promise.all(moduleData.map((module) => prisma.module.create({
    data: {
      institutionId: institution.id,
      courseId: savedCourses[module.course_index].id,
      module_code: module.module_code,
      module_name: module.module_name,
      credit_hours: 1,
      description: `${module.module_name} description`,
    },
  })))

  const resultSeed = [
    { student_index: 0, course_index: 0, assignment_score: 88, exam_score: 91, percentage: 90, grade: 'A', pass_fail: 'PASS' },
    { student_index: 1, course_index: 1, assignment_score: 76, exam_score: 81, percentage: 79, grade: 'C', pass_fail: 'PASS' },
    { student_index: 2, course_index: 0, assignment_score: 64, exam_score: 72, percentage: 68, grade: 'D', pass_fail: 'PASS' },
    { student_index: 3, course_index: 2, assignment_score: 80, exam_score: 84, percentage: 82, grade: 'B', pass_fail: 'PASS' },
    { student_index: 4, course_index: 3, assignment_score: 58, exam_score: 66, percentage: 62, grade: 'D', pass_fail: 'PASS' },
  ]

  await Promise.all(resultSeed.map((result) => prisma.result.create({
    data: {
      institutionId: institution.id,
      studentId: studentRecords[result.student_index].id,
      courseId: savedCourses[result.course_index].id,
      assignment_score: result.assignment_score,
      exam_score: result.exam_score,
      total_score: result.assignment_score + result.exam_score,
      percentage: result.percentage,
      grade: result.grade,
      pass_fail: result.pass_fail,
      academic_session: '2024/2025',
    },
  })))
}

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN?.split(',') || true,
    credentials: true,
  }),
)
app.use(express.json())
app.use('/uploads/documents', express.static(path.resolve(process.cwd(), 'uploads', 'documents')))
app.use(auditLogger('http-request'))

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
app.use('/api/departments', departmentsRoutes)
app.use('/api/faculties', facultiesRoutes)
app.use('/api/institution', institutionRoutes)
app.use('/api/modules', modulesRoutes)
app.use('/api/platform', platformRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/academics', academicsRoutes)
app.use('/api/registration', registrationRoutes)
app.use('/api/staff', staffRoutes)
app.use('/api/assessments', assessmentsRoutes)
app.use('/api/examination', examinationRoutes)
app.use('/api/approval', approvalRoutes)
app.use('/api/documents', documentsRoutes)
app.use('/api/reports', reportsRoutes)
app.use('/api/communication', communicationRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/roles', rolesRoutes)

app.get('/api/dashboard', async (req, res) => {
  try {
    const totalStudents = await prisma.student.count()
    const totalCourses = await prisma.course.count()
    const totalResults = await prisma.result.count()
    const avgPerformance = await prisma.result.aggregate({ _avg: { percentage: true } })

    const students = await prisma.student.findMany({
      orderBy: { id: 'desc' },
      take: 5,
      include: { department: { select: { name: true } } },
    })

    const recentResults = await prisma.result.findMany({
      orderBy: { id: 'desc' },
      take: 5,
      include: {
        student: { select: { full_name: true } },
        course: { select: { course_name: true } },
      },
    })

    res.json({
      stats: [
        { label: 'Students', value: totalStudents, trend: '+8.2%' },
        { label: 'Courses', value: totalCourses, trend: '+4.1%' },
        { label: 'Results', value: totalResults, trend: '+12.4%' },
        { label: 'Avg', value: `${Math.round(avgPerformance._avg.percentage || 0)}%`, trend: '+2.6%' },
      ],
      students: students.map((student) => ({
        id: student.id,
        student_id: student.student_id,
        full_name: student.full_name,
        semester: student.semester,
        department_name: student.department?.name ?? null,
      })),
      recentResults: recentResults.map((result) => ({
        id: result.id,
        percentage: result.percentage,
        grade: result.grade,
        student_name: result.student.full_name,
        course_name: result.course.course_name,
      })),
    })
  } catch (error) {
    console.error('Dashboard query failed:', error)
    res.status(500).json({ message: 'Dashboard data could not be loaded.' })
  }
})

try {
  await prisma.$connect()

  try {
    await seedDemoData()
  } catch (seedError) {
    console.warn('Demo seeding skipped:', seedError.message)
  }

  app.listen(port, () => {
    console.log(`URMIS API running on http://localhost:${port}`)
  })
} catch (error) {
  console.error('Failed to start app:', error)
  process.exit(1)
}

export default app
