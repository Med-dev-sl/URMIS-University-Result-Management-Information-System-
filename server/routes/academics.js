import { Router } from 'express'
import prisma from '../prisma.js'
import { requireAuth } from '../shared/middlewares/auth.js'

const router = Router()

router.get('/structure', requireAuth, async (req, res) => {
  try {
    const where = {}
    if (req.user.role !== 'admin') {
      where.id = req.user.institutionId
    }

    const institutions = await prisma.institution.findMany({
      where,
      orderBy: { id: 'asc' },
      include: {
        faculties: {
          orderBy: { id: 'asc' },
          include: {
            departments: {
              orderBy: { id: 'asc' },
              include: {
                courses: {
                  orderBy: { id: 'asc' },
                  include: {
                    modules: {
                      orderBy: { id: 'asc' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    res.json(
      institutions.map((institution) => ({
        id: institution.id,
        name: institution.name,
        address: institution.address,
        contact_email: institution.contact_email,
        created_at: institution.created_at,
        faculties: institution.faculties.map((faculty) => ({
          id: faculty.id,
          name: faculty.name,
          created_at: faculty.created_at,
          departments: faculty.departments.map((department) => ({
            id: department.id,
            name: department.name,
            created_at: department.created_at,
            courses: department.courses.map((course) => ({
              id: course.id,
              course_code: course.course_code,
              course_name: course.course_name,
              credit_hours: course.credit_hours,
              created_at: course.created_at,
              modules: course.modules.map((module) => ({
                id: module.id,
                module_code: module.module_code,
                module_name: module.module_name,
                credit_hours: module.credit_hours,
                description: module.description,
                created_at: module.created_at,
              })),
            })),
          })),
        })),
      })),
    )
  } catch (error) {
    console.error('Failed to load academic structure:', error)
    res.status(500).json({ message: 'Unable to load academic structure.' })
  }
})

export default router
