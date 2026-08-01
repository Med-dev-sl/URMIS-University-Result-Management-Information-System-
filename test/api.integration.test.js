import assert from 'node:assert/strict'
import test from 'node:test'
import supertest from 'supertest'
import { createApp } from '../server/app.js'
import prisma from '../server/prisma.js'
import bcrypt from 'bcryptjs'

let app
let request
let adminToken
let staffToken
let testDepartmentId

async function seedTestData() {
  await prisma.$connect()
  await prisma.$transaction([
    prisma.$executeRawUnsafe('DELETE FROM User'),
    prisma.$executeRawUnsafe('DELETE FROM Result'),
    prisma.$executeRawUnsafe('DELETE FROM Course'),
    prisma.$executeRawUnsafe('DELETE FROM Student'),
    prisma.$executeRawUnsafe('DELETE FROM Department'),
    prisma.$executeRawUnsafe('DELETE FROM Faculty'),
    prisma.$executeRawUnsafe('DELETE FROM Institution'),
  ])

  const institution = await prisma.institution.create({
    data: {
      name: 'Test University',
      address: 'Test Address',
      contact_email: 'test@example.edu',
    },
  })

  const faculty = await prisma.faculty.create({
    data: {
      institutionId: institution.id,
      name: 'Faculty of Test',
    },
  })

  const department = await prisma.department.create({
    data: {
      institutionId: institution.id,
      facultyId: faculty.id,
      name: 'Department of Test',
    },
  })

  testDepartmentId = department.id

  const adminUser = await prisma.user.create({
    data: {
      institutionId: institution.id,
      full_name: 'Admin User',
      email: 'admin@test.edu',
      password_hash: await bcrypt.hash('Admin@123', 10),
      role: 'admin',
      updated_at: new Date(),
    },
  })

  const staffUser = await prisma.user.create({
    data: {
      institutionId: institution.id,
      full_name: 'Staff User',
      email: 'staff@test.edu',
      password_hash: await bcrypt.hash('Staff@123', 10),
      role: 'staff',
      updated_at: new Date(),
    },
  })

  await prisma.student.create({
    data: {
      institutionId: institution.id,
      departmentId: department.id,
      student_id: 'TST-001',
      full_name: 'Student One',
      semester: '400 Level',
      enrollment_year: '2024',
    },
  })

  await prisma.course.create({
    data: {
      institutionId: institution.id,
      departmentId: department.id,
      course_code: 'TEST101',
      course_name: 'Test Course',
      credit_hours: 3,
    },
  })

  return { adminUser, staffUser }
}

test.before(async () => {
  const { adminUser, staffUser } = await seedTestData()
  app = await createApp({ seedData: false })
  request = supertest(app)

  const adminLogin = await request.post('/api/auth/login').send({ email: adminUser.email, password: 'Admin@123' })
  const staffLogin = await request.post('/api/auth/login').send({ email: staffUser.email, password: 'Staff@123' })
  adminToken = adminLogin.body.accessToken
  staffToken = staffLogin.body.accessToken
})

test.after(async () => {
  await prisma.$disconnect()
})

test('health endpoint responds successfully', async () => {
  const response = await request.get('/api/health')
  assert.equal(response.status, 200)
  assert.equal(response.body.status, 'ok')
})

test('auth login rejects invalid credentials', async () => {
  const response = await request.post('/api/auth/login').send({ email: 'missing@test.edu', password: 'wrong' })
  assert.equal(response.status, 401)
})

test('protected routes reject missing authentication', async () => {
  const response = await request.get('/api/students')
  assert.equal(response.status, 401)
})

test('students CRUD requires admin or staff and validates input', async () => {
  const createResponse = await request.post('/api/students').set('Authorization', `Bearer ${staffToken}`).send({ student_id: 'TST-002', full_name: 'Student Two' })
  assert.equal(createResponse.status, 201)
  assert.equal(createResponse.body.student_id, 'TST-002')

  const invalidCreate = await request.post('/api/students').set('Authorization', `Bearer ${staffToken}`).send({ full_name: 'Missing ID' })
  assert.equal(invalidCreate.status, 400)

  const listResponse = await request.get('/api/students').set('Authorization', `Bearer ${staffToken}`)
  assert.equal(listResponse.status, 200)
  assert.ok(Array.isArray(listResponse.body))
})

test('results CRUD supports filtering and creates normalized responses', async () => {
  const studentList = await request.get('/api/students').set('Authorization', `Bearer ${adminToken}`)
  const student = studentList.body[0]
  const courses = await request.get('/api/courses').set('Authorization', `Bearer ${adminToken}`)
  const course = courses.body[0]

  const createResponse = await request.post('/api/results').set('Authorization', `Bearer ${adminToken}`).send({
    student_id: student.id,
    course_id: course.id,
    assignment_score: 80,
    exam_score: 90,
    academic_session: '2024/2025',
  })

  assert.equal(createResponse.status, 201)
  assert.equal(createResponse.body.grade, 'B')

  const filterResponse = await request.get('/api/results').set('Authorization', `Bearer ${adminToken}`).query({ academic_session: '2024/2025' })
  assert.equal(filterResponse.status, 200)
  assert.ok(filterResponse.body.length >= 1)
})

test('courses CRUD enforces role access and returns consistent payloads', async () => {
  const createResponse = await request.post('/api/courses').set('Authorization', `Bearer ${adminToken}`).send({
    course_code: 'TEST102',
    course_name: 'Advanced Test',
    department_id: testDepartmentId,
    credit_hours: 3,
  })
  assert.equal(createResponse.status, 201)
  assert.equal(createResponse.body.course_code, 'TEST102')

  const allowedByStaff = await request.post('/api/courses').set('Authorization', `Bearer ${staffToken}`).send({
    course_code: 'TEST103',
    course_name: 'Allowed by staff',
    department_id: testDepartmentId,
    credit_hours: 3,
  })
  assert.equal(allowedByStaff.status, 201)
  assert.equal(allowedByStaff.body.course_code, 'TEST103')
})
