import { Router } from 'express'
import prisma from '../prisma.js'
import { requireAuth, requireRole } from '../../shared/middlewares/auth.js'

const router = Router()

router.get('/', requireAuth, async (req, res) => {
  try {
    const where = {}

    if (req.user.role !== 'admin') {
      where.institutionId = req.user.institutionId
    }
    if (req.query.course_id) {
      where.courseId = Number(req.query.course_id)
    }

    const modules = await prisma.module.findMany({
      where,
      orderBy: { id: 'desc' },
      include: {
        course: { select: { course_name: true } },
      },
    })

    res.json(
      modules.map((module) => ({
        id: module.id,
        module_code: module.module_code,
        module_name: module.module_name,
        credit_hours: module.credit_hours,
        description: module.description,
        course_id: module.courseId,
        course_name: module.course?.course_name ?? null,
      })),
    )
  } catch (error) {
    console.error('Failed to fetch modules:', error)
    res.status(500).json({ message: 'Unable to load modules.' })
  }
})

router.post('/', requireAuth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const { module_code, module_name, credit_hours, description, course_id } = req.body

    if (!module_code || !module_name || !course_id) {
      return res.status(400).json({ message: 'Module code, name, and course_id are required.' })
    }

    const course = await prisma.course.findUnique({
      where: { id: Number(course_id) },
      select: { id: true, institutionId: true },
    })

    if (!course) {
      return res.status(404).json({ message: 'Course not found.' })
    }

    if (req.user.role !== 'admin' && course.institutionId !== req.user.institutionId) {
      return res.status(403).json({ message: 'Forbidden: course belongs to another institution.' })
    }

    const createdModule = await prisma.module.create({
      data: {
        institutionId: course.institutionId,
        courseId: course.id,
        module_code,
        module_name,
        credit_hours: Number(credit_hours) || 1,
        description: description || '',
      },
    })

    res.status(201).json(createdModule)
  } catch (error) {
    console.error('Failed to create module:', error)
    res.status(500).json({ message: 'Unable to create module.' })
  }
})

export default router
