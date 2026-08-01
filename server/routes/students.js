import { Router } from 'express'
import prisma from '../prisma.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      orderBy: { id: 'desc' },
      include: {
        department: {
          select: { name: true },
        },
      },
    })

    const mapped = students.map((s) => ({
      id: s.id,
      student_id: s.student_id,
      full_name: s.full_name,
      semester: s.semester,
      enrollment_year: s.enrollment_year,
      department_name: s.department?.name ?? null,
    }))

    res.json(mapped)
  } catch (error) {
    console.error('Load students failed:', error)
    res.status(500).json({ message: 'Unable to load students.' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { student_id, full_name, department_id, semester, enrollment_year } = req.body

    if (!student_id || !full_name) {
      return res.status(400).json({ message: 'student_id and full_name are required.' })
    }

    const institution = await prisma.institution.findFirst({ orderBy: { id: 'asc' } })

    const student = await prisma.student.create({
      data: {
        institutionId: institution?.id ?? 1,
        student_id,
        full_name,
        departmentId: department_id ?? null,
        semester: semester ?? '100 Level',
        enrollment_year: enrollment_year ?? '2025',
      },
      include: {
        department: {
          select: { name: true },
        },
      },
    })

    res.status(201).json({
      id: student.id,
      student_id: student.student_id,
      full_name: student.full_name,
      semester: student.semester,
      enrollment_year: student.enrollment_year,
      department_name: student.department?.name ?? null,
    })
  } catch (error) {
    console.error('Create student failed:', error)
    return res.status(500).json({ message: 'Unable to create student.' })
  }
})

export default router
