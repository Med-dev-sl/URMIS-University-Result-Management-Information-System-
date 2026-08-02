import { Router } from 'express'
import prisma from '../../prisma.js'
import { requireAuth, requireRole } from '../../shared/middlewares/auth.js'
import departmentsRoutes from './departments.js'
import facultiesRoutes from './faculties.js'

const router = Router()

router.get('/', requireAuth, async (req, res) => {
  try {
    const where = {}
    if (req.user.role !== 'admin') {
      where.id = req.user.institutionId
    }

    const institutions = await prisma.institution.findMany({
      where,
      orderBy: { id: 'asc' },
    })

    res.json(
      institutions.map((institution) => ({
        id: institution.id,
        name: institution.name,
        address: institution.address,
        contact_email: institution.contact_email,
        created_at: institution.created_at,
      })),
    )
  } catch (error) {
    console.error('Failed to fetch institutions:', error)
    res.status(500).json({ message: 'Unable to load institutions.' })
  }
})

router.get('/:institutionId', requireAuth, async (req, res) => {
  try {
    const institutionId = Number(req.params.institutionId)
    if (Number.isNaN(institutionId)) {
      return res.status(400).json({ message: 'Invalid institution identifier.' })
    }

    const institution = await prisma.institution.findUnique({
      where: { id: institutionId },
      include: {
        faculties: { select: { id: true, name: true } },
        departments: { select: { id: true, name: true, facultyId: true } },
      },
    })

    if (!institution) {
      return res.status(404).json({ message: 'Institution not found.' })
    }

    if (req.user.role !== 'admin' && req.user.institutionId !== institution.id) {
      return res.status(403).json({ message: 'Forbidden: access denied to this institution.' })
    }

    res.json({
      id: institution.id,
      name: institution.name,
      address: institution.address,
      contact_email: institution.contact_email,
      created_at: institution.created_at,
      faculties: institution.faculties,
      departments: institution.departments,
    })
  } catch (error) {
    console.error('Failed to fetch institution details:', error)
    res.status(500).json({ message: 'Unable to load institution details.' })
  }
})

router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { name, address, contact_email } = req.body

    if (!name) {
      return res.status(400).json({ message: 'Institution name is required.' })
    }

    const createdInstitution = await prisma.institution.create({
      data: {
        name,
        address: address || null,
        contact_email: contact_email || null,
      },
    })

    res.status(201).json({
      id: createdInstitution.id,
      name: createdInstitution.name,
      address: createdInstitution.address,
      contact_email: createdInstitution.contact_email,
      created_at: createdInstitution.created_at,
    })
  } catch (error) {
    console.error('Failed to create institution:', error)
    res.status(500).json({ message: 'Unable to create institution.' })
  }
})

router.put('/:institutionId', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const institutionId = Number(req.params.institutionId)
    if (Number.isNaN(institutionId)) {
      return res.status(400).json({ message: 'Invalid institution identifier.' })
    }

    const existingInstitution = await prisma.institution.findUnique({ where: { id: institutionId } })
    if (!existingInstitution) {
      return res.status(404).json({ message: 'Institution not found.' })
    }

    const { name, address, contact_email } = req.body
    const updatedInstitution = await prisma.institution.update({
      where: { id: institutionId },
      data: {
        name: name ?? existingInstitution.name,
        address: address ?? existingInstitution.address,
        contact_email: contact_email ?? existingInstitution.contact_email,
      },
    })

    res.json({
      id: updatedInstitution.id,
      name: updatedInstitution.name,
      address: updatedInstitution.address,
      contact_email: updatedInstitution.contact_email,
      created_at: updatedInstitution.created_at,
    })
  } catch (error) {
    console.error('Failed to update institution:', error)
    res.status(500).json({ message: 'Unable to update institution.' })
  }
})

router.delete('/:institutionId', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const institutionId = Number(req.params.institutionId)
    if (Number.isNaN(institutionId)) {
      return res.status(400).json({ message: 'Invalid institution identifier.' })
    }

    const existingInstitution = await prisma.institution.findUnique({ where: { id: institutionId } })
    if (!existingInstitution) {
      return res.status(404).json({ message: 'Institution not found.' })
    }

    await prisma.institution.delete({ where: { id: institutionId } })
    res.status(204).send()
  } catch (error) {
    console.error('Failed to delete institution:', error)
    res.status(500).json({ message: 'Unable to delete institution.' })
  }
})

router.use('/faculties', facultiesRoutes)
router.use('/departments', departmentsRoutes)

export default router
