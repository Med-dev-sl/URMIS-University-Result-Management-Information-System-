import bcrypt from 'bcryptjs'
import { Router } from 'express'
import prisma from '../prisma.js'
import authService from '../shared/services/authService.js'
import { requireAuth, requireRole } from '../shared/middlewares/auth.js'

const router = Router()

function normalizeUser(user) {
  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
    institutionId: user.institutionId,
    created_at: user.created_at,
  }
}

async function hashPassword(password) {
  return bcrypt.hash(password, 10)
}

router.get('/', requireAuth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const where = {}

    if (req.user.role !== 'admin') {
      where.institutionId = req.user.institutionId
    }
    if (req.query.role) {
      where.role = req.query.role
    }
    if (req.query.institution_id) {
      where.institutionId = Number(req.query.institution_id)
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { id: 'desc' },
    })

    res.json(users.map(normalizeUser))
  } catch (error) {
    console.error('Failed to fetch users:', error)
    res.status(500).json({ message: 'Unable to load users.' })
  }
})

router.get('/:id', requireAuth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const userId = Number(req.params.id)
    if (Number.isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user identifier.' })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return res.status(404).json({ message: 'User not found.' })
    }

    if (req.user.role !== 'admin' && user.institutionId !== req.user.institutionId) {
      return res.status(403).json({ message: 'Forbidden: cannot access users from another institution.' })
    }

    res.json(normalizeUser(user))
  } catch (error) {
    console.error('Failed to fetch user:', error)
    res.status(500).json({ message: 'Unable to load user.' })
  }
})

router.post('/', requireAuth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const { full_name, email, password, role, institutionId } = req.body

    if (!full_name || !email || !password) {
      return res.status(400).json({ message: 'full_name, email, and password are required.' })
    }

    let targetInstitutionId = institutionId ?? req.user.institutionId
    if (!targetInstitutionId && req.user.role === 'admin') {
      const firstInstitution = await prisma.institution.findFirst({ orderBy: { id: 'asc' }, select: { id: true } })
      if (!firstInstitution) {
        return res.status(400).json({ message: 'No institution exists to assign the user to.' })
      }
      targetInstitutionId = firstInstitution.id
    }

    if (req.user.role !== 'admin' && targetInstitutionId !== req.user.institutionId) {
      return res.status(403).json({ message: 'Forbidden: cannot create users for another institution.' })
    }

    const user = await authService.register({
      full_name,
      email,
      password,
      institutionId: targetInstitutionId,
      role: role || 'student',
    })

    res.status(201).json(user)
  } catch (error) {
    console.error('Failed to create user:', error)
    res.status(400).json({ message: error.message || 'Unable to create user.' })
  }
})

router.put('/:id', requireAuth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const userId = Number(req.params.id)
    if (Number.isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user identifier.' })
    }

    const existingUser = await prisma.user.findUnique({ where: { id: userId } })
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found.' })
    }

    if (req.user.role !== 'admin' && existingUser.institutionId !== req.user.institutionId) {
      return res.status(403).json({ message: 'Forbidden: cannot update users from another institution.' })
    }

    const { full_name, email, role, institutionId, password } = req.body
    const updateData = {}

    if (full_name) updateData.full_name = full_name
    if (email) updateData.email = email
    if (role) {
      if (req.user.role !== 'admin' && role !== existingUser.role) {
        return res.status(403).json({ message: 'Forbidden: cannot change role.' })
      }
      updateData.role = role
    }
    if (password) {
      updateData.password_hash = await hashPassword(password)
      updateData.refresh_token = null
    }
    if (institutionId != null) {
      if (req.user.role !== 'admin' && Number(institutionId) !== req.user.institutionId) {
        return res.status(403).json({ message: 'Forbidden: cannot change institution.' })
      }
      updateData.institutionId = Number(institutionId)
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No fields provided for update.' })
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    })

    res.json(normalizeUser(updatedUser))
  } catch (error) {
    console.error('Failed to update user:', error)
    res.status(400).json({ message: error.message || 'Unable to update user.' })
  }
})

router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const userId = Number(req.params.id)
    if (Number.isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user identifier.' })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return res.status(404).json({ message: 'User not found.' })
    }

    await prisma.user.delete({ where: { id: userId } })
    res.status(204).send()
  } catch (error) {
    console.error('Failed to delete user:', error)
    res.status(500).json({ message: 'Unable to delete user.' })
  }
})

export default router
