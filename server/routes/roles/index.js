import { Router } from 'express'
import bcrypt from 'bcryptjs'
import prisma from '../../prisma.js'
import { requireAuth, requirePermission, requireRole } from '../../shared/middlewares/auth.js'
import { getEffectivePermissions, listAvailableRoles, normalizeRoleName } from '../../shared/services/rbacService.js'

const router = Router()

const roleAdminMiddleware = [requireAuth, requireRole('super_admin', 'admin')]
const permissionMiddleware = [requireAuth, requirePermission('manage_permissions')]

function normalizeUser(user) {
  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
    institutionId: user.institutionId,
    isSuspended: user.isSuspended,
    isLocked: user.isLocked,
    mustChangePassword: user.mustChangePassword,
    created_at: user.created_at,
    updated_at: user.updated_at,
  }
}

router.get('/roles', ...roleAdminMiddleware, async (req, res) => {
  try {
    return res.json(listAvailableRoles())
  } catch (error) {
    console.error('Failed to list roles:', error)
    return res.status(500).json({ message: 'Unable to list roles.' })
  }
})

router.get('/permissions', ...permissionMiddleware, async (req, res) => {
  try {
    const roles = listAvailableRoles().map(({ value }) => value)
    const permissions = {}

    for (const role of roles) {
      permissions[role] = await getEffectivePermissions(role)
    }

    return res.json(permissions)
  } catch (error) {
    console.error('Failed to list permissions:', error)
    return res.status(500).json({ message: 'Unable to list permissions.' })
  }
})

router.get('/users', ...roleAdminMiddleware, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { id: 'desc' },
      select: {
        id: true,
        full_name: true,
        email: true,
        role: true,
        institutionId: true,
        isSuspended: true,
        isLocked: true,
        mustChangePassword: true,
        created_at: true,
        updated_at: true,
      },
    })
    return res.json(users.map(normalizeUser))
  } catch (error) {
    console.error('Failed to list users:', error)
    return res.status(500).json({ message: 'Unable to list users.' })
  }
})

router.put('/users/:id/role', ...roleAdminMiddleware, async (req, res) => {
  try {
    const userId = Number(req.params.id)
    const nextRole = normalizeRoleName(req.body.role || req.body.newRole)

    if (!nextRole) {
      return res.status(400).json({ message: 'A role is required.' })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return res.status(404).json({ message: 'User not found.' })
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role: nextRole },
    })

    return res.json(normalizeUser(updated))
  } catch (error) {
    console.error('Failed to update role:', error)
    return res.status(500).json({ message: 'Unable to update role.' })
  }
})

router.put('/users/:id/suspend', ...roleAdminMiddleware, async (req, res) => {
  try {
    const userId = Number(req.params.id)
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isSuspended: true, suspendedAt: new Date() },
    })

    return res.json(normalizeUser(updated))
  } catch (error) {
    console.error('Failed to suspend user:', error)
    return res.status(500).json({ message: 'Unable to suspend user.' })
  }
})

router.put('/users/:id/activate', ...roleAdminMiddleware, async (req, res) => {
  try {
    const userId = Number(req.params.id)
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isSuspended: false, suspendedAt: null },
    })

    return res.json(normalizeUser(updated))
  } catch (error) {
    console.error('Failed to activate user:', error)
    return res.status(500).json({ message: 'Unable to activate user.' })
  }
})

router.put('/users/:id/lock', ...roleAdminMiddleware, async (req, res) => {
  try {
    const userId = Number(req.params.id)
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isLocked: true, lockedAt: new Date() },
    })

    return res.json(normalizeUser(updated))
  } catch (error) {
    console.error('Failed to lock user:', error)
    return res.status(500).json({ message: 'Unable to lock user.' })
  }
})

router.put('/users/:id/unlock', ...roleAdminMiddleware, async (req, res) => {
  try {
    const userId = Number(req.params.id)
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isLocked: false, lockedAt: null },
    })

    return res.json(normalizeUser(updated))
  } catch (error) {
    console.error('Failed to unlock user:', error)
    return res.status(500).json({ message: 'Unable to unlock user.' })
  }
})

router.put('/users/:id/reset-password', ...roleAdminMiddleware, async (req, res) => {
  try {
    const userId = Number(req.params.id)
    const newPassword = String(req.body.password || req.body.newPassword || 'Temp@12345')
    const hash = await bcrypt.hash(newPassword, 10)
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        password_hash: hash,
        refresh_token: null,
        mustChangePassword: true,
      },
    })

    return res.json({ message: 'Password reset', user: normalizeUser(updated) })
  } catch (error) {
    console.error('Failed to reset password:', error)
    return res.status(500).json({ message: 'Unable to reset password.' })
  }
})

router.put('/users/:id/force-password-change', ...roleAdminMiddleware, async (req, res) => {
  try {
    const userId = Number(req.params.id)
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { mustChangePassword: true },
    })

    return res.json(normalizeUser(updated))
  } catch (error) {
    console.error('Failed to force password change:', error)
    return res.status(500).json({ message: 'Unable to force password change.' })
  }
})

router.post('/permissions', ...permissionMiddleware, async (req, res) => {
  try {
    const role = normalizeRoleName(req.body.role)
    const permission = String(req.body.permission || '').trim()
    const granted = req.body.granted !== false

    if (!role || !permission) {
      return res.status(400).json({ message: 'Role and permission are required.' })
    }

    const upserted = await prisma.rolePermission.upsert({
      where: { role_permission: { role, permission } },
      update: { granted },
      create: { role, permission, granted },
    })

    return res.json(upserted)
  } catch (error) {
    console.error('Failed to set permission:', error)
    return res.status(500).json({ message: 'Unable to update permission.' })
  }
})

export default router
