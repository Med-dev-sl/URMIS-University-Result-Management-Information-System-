import { Router } from 'express'
import prisma from '../prisma.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const where = {}

    if (req.query.department_id) {
      where.departmentId = Number(req.query.department_id)
    }

    const courses = await prisma.course.findMany({
      where,
      orderBy: { id: 'desc' },
    })

    res.json(courses)
  } catch (error) {
    console.error('Failed to fetch courses:', error)
    res.status(500).json({ message: 'Unable to load courses.' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { course_code, course_name, credit_hours, department_id } = req.body

    if (!course_code || !course_name || !department_id) {
      return res.status(400).json({ message: 'Course code, name, and department_id are required.' })
    }

    const department = await prisma.department.findUnique({
      where: { id: Number(department_id) },
      select: { id: true },
    })

    if (!department) {
      return res.status(404).json({ message: 'Department not found.' })
    }

    const institution = await prisma.institution.findFirst({ orderBy: { id: 'asc' } })

    const createdCourse = await prisma.course.create({
      data: {
        institutionId: institution?.id ?? 1,
        departmentId: department.id,
        course_code,
        course_name,
        credit_hours: Number(credit_hours) || 3,
      },
    })

    res.status(201).json(createdCourse)
  } catch (error) {
    console.error('Failed to create course:', error)
    res.status(500).json({ message: 'Unable to create course.' })
  }
})

export default router
