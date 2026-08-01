import bcrypt from 'bcryptjs'
import { Router } from 'express'
import prisma from '../../prisma.js'
import authService from '../../shared/services/authService.js'
import { requireAuth, requireRole } from '../../shared/middlewares/auth.js'

const router = Router()

const staffRoles = [
  'admin',
  'staff',
  'lecturer',
  'dean',
  'hod',
  'exam_officer',
  'university_administrator',
]

const normalizeUser = (user) => ({
  id: user.id,
  full_name: user.full_name,
  email: user.email,
  role: user.role,
  institutionId: user.institutionId,
  created_at: user.created_at,
})

const isStaffRole = (role) => staffRoles.includes(role)

const hashPassword = async (password) => bcrypt.hash(password, 10)

router.get('/', requireAuth, requireRole('admin', 'staff', 'lecturer', 'dean', 'hod', 'exam_officer', 'university_administrator'), async (req, res) => {
  try {
    const where = { role: { in: staffRoles } }
    if (req.user.role !== 'admin') {
      where.institutionId = req.user.institutionId
    }
    if (req.query.role) {
      const role = String(req.query.role)
      if (!isStaffRole(role)) {
        return res.status(400).json({ message: 'Invalid staff role filter.' })
      }
      where.role = role
    }
    if (req.query.email) {
      where.email = { contains: String(req.query.email), mode: 'insensitive' }
    }

    const users = await prisma.user.findMany({ where, orderBy: { id: 'desc' } })
    res.json(users.map(normalizeUser))
  } catch (error) {
    console.error('Failed to load staff:', error)
    res.status(500).json({ message: 'Unable to load staff.' })
  }
})

router.get('/:id', requireAuth, requireRole('admin', 'staff', 'lecturer', 'dean', 'hod', 'exam_officer', 'university_administrator'), async (req, res) => {
  try {
    const staffId = Number(req.params.id)
    if (Number.isNaN(staffId)) {
      return res.status(400).json({ message: 'Invalid staff identifier.' })
    }

    const user = await prisma.user.findUnique({ where: { id: staffId } })
    if (!user || !isStaffRole(user.role)) {
      return res.status(404).json({ message: 'Staff member not found.' })
    }

    if (req.user.role !== 'admin' && user.institutionId !== req.user.institutionId) {
      return res.status(403).json({ message: 'Forbidden: access denied.' })
    }

    res.json(normalizeUser(user))
  } catch (error) {
    console.error('Failed to load staff member:', error)
    res.status(500).json({ message: 'Unable to load staff member.' })
  }
})

router.post('/', requireAuth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const { full_name, email, password, role, institutionId } = req.body
    if (!full_name || !email || !password) {
      return res.status(400).json({ message: 'full_name, email, and password are required.' })
    }

    const staffRole = role ? String(role) : 'staff'
    if (!isStaffRole(staffRole)) {
      return res.status(400).json({ message: 'Invalid staff role.' })
    }

    let targetInstitutionId = institutionId ?? req.user.institutionId
    if (!targetInstitutionId && req.user.role === 'admin') {
      const institution = await prisma.institution.findFirst({ orderBy: { id: 'asc' }, select: { id: true } })
      if (!institution) {
        return res.status(400).json({ message: 'No institution exists to assign the staff member to.' })
      }
      targetInstitutionId = institution.id
    }

    if (req.user.role !== 'admin' && targetInstitutionId !== req.user.institutionId) {
      return res.status(403).json({ message: 'Forbidden: cannot create staff for another institution.' })
    }

    const user = await authService.register({
      full_name,
      email,
      password,
      institutionId: targetInstitutionId,
      role: staffRole,
    })

    res.status(201).json(user)
  } catch (error) {
    console.error('Failed to create staff member:', error)
    res.status(400).json({ message: error.message || 'Unable to create staff member.' })
  }
})

router.put('/:id', requireAuth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const staffId = Number(req.params.id)
    if (Number.isNaN(staffId)) {
      return res.status(400).json({ message: 'Invalid staff identifier.' })
    }

    const existingUser = await prisma.user.findUnique({ where: { id: staffId } })
    if (!existingUser || !isStaffRole(existingUser.role)) {
      return res.status(404).json({ message: 'Staff member not found.' })
    }

    if (req.user.role !== 'admin' && existingUser.institutionId !== req.user.institutionId) {
      return res.status(403).json({ message: 'Forbidden: cannot update staff from another institution.' })
    }

    const { full_name, email, password, role, institutionId } = req.body
    const updateData = {}

    if (full_name) updateData.full_name = full_name
    if (email) updateData.email = email
    if (role) {
      const staffRole = String(role)
      if (!isStaffRole(staffRole)) {
        return res.status(400).json({ message: 'Invalid staff role.' })
      }
      updateData.role = staffRole
    }
    if (password) {
      updateData.password_hash = await hashPassword(password)
      updateData.refresh_token = null
    }

    if (institutionId !== undefined) {
      if (req.user.role !== 'admin' && Number(institutionId) !== req.user.institutionId) {
        return res.status(403).json({ message: 'Forbidden: cannot change institution.' })
      }
      updateData.institutionId = Number(institutionId)
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No fields provided for update.' })
    }

    const updatedUser = await prisma.user.update({ where: { id: staffId }, data: updateData })
    res.json(normalizeUser(updatedUser))
  } catch (error) {
    console.error('Failed to update staff member:', error)
    res.status(400).json({ message: error.message || 'Unable to update staff member.' })
  }
})

router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const staffId = Number(req.params.id)
    if (Number.isNaN(staffId)) {
      return res.status(400).json({ message: 'Invalid staff identifier.' })
    }

    const existingUser = await prisma.user.findUnique({ where: { id: staffId } })
    if (!existingUser || !isStaffRole(existingUser.role)) {
      return res.status(404).json({ message: 'Staff member not found.' })
    }

    await prisma.user.delete({ where: { id: staffId } })
    res.status(204).send()
  } catch (error) {
    console.error('Failed to delete staff member:', error)
    res.status(500).json({ message: 'Unable to delete staff member.' })
  }
})

export default router
