import { Router } from 'express'
import prisma from '../prisma.js'
import { requireAuth, requireRole } from '../../shared/middlewares/auth.js'

const router = Router()

const resolveInstitutionId = async (req) => {
  if (req.user.role === 'admin') {
    if (req.user.institutionId) {
      return req.user.institutionId
    }

    const institution = await prisma.institution.findFirst({ orderBy: { id: 'asc' }, select: { id: true } })
    if (!institution) {
      throw new Error('No institution is configured for admin operations.')
    }

    return institution.id
  }

  if (!req.user.institutionId) {
    throw new Error('Tenant context is required for this operation.')
  }

  return req.user.institutionId
}

router.get('/', requireAuth, async (req, res) => {
  try {
    const where = {}

    if (req.user.role !== 'admin') {
      where.institutionId = req.user.institutionId
    }

    const faculties = await prisma.faculty.findMany({
      where,
      orderBy: { id: 'desc' },
      include: { institution: { select: { name: true } } },
    })

    res.json(
      faculties.map((faculty) => ({
        id: faculty.id,
        name: faculty.name,
        institution_name: faculty.institution?.name ?? null,
      })),
    )
  } catch (error) {
    console.error('Failed to fetch faculties:', error)
    res.status(500).json({ message: 'Unable to load faculties.' })
  }
})

router.post('/', requireAuth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const { name } = req.body

    if (!name) {
      return res.status(400).json({ message: 'Faculty name is required.' })
    }

    const institutionId = await resolveInstitutionId(req)

    const createdFaculty = await prisma.faculty.create({
      data: {
        institutionId,
        name,
      },
    })

    res.status(201).json(createdFaculty)
  } catch (error) {
    console.error('Failed to create faculty:', error)
    res.status(500).json({ message: 'Unable to create faculty.' })
  }
})

export default router
