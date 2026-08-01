import authService from '../services/authService.js'
import { attachUserContext, hasPermission, normalizeRoleName } from '../services/rbacService.js'

export async function requireAuth(req, res, next) {
  const token = authService.getTokenFromRequest(req, 'access')
  if (!token) {
    return res.status(401).json({ message: 'Authorization token missing' })
  }

  try {
    const payload = await authService.verifyAccessToken(token)
    const user = await authService.getUserById(payload.userId)
    if (!user) {
      return res.status(401).json({ message: 'Invalid or expired token' })
    }

    const userContext = await attachUserContext(user)
    if (userContext.isSuspended) {
      return res.status(403).json({ message: 'Account suspended' })
    }
    if (userContext.isLocked) {
      return res.status(403).json({ message: 'Account locked' })
    }

    req.user = userContext
    return next()
  } catch (error) {
    return res.status(401).json({ message: error.message || 'Invalid or expired token' })
  }
}

export function requireRole(...allowedRoles) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const normalizedAllowed = allowedRoles.map(normalizeRoleName)
    const normalizedRole = normalizeRoleName(req.user.role)
    if (!normalizedAllowed.includes(normalizedRole)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role' })
    }

    return next()
  }
}

export function requirePermission(permission) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    if (!hasPermission(req.user, permission)) {
      return res.status(403).json({ message: 'Forbidden: insufficient permissions' })
    }

    return next()
  }
}

export function requireTenantMatch(fieldName = 'institutionId') {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    if (req.user.role === 'admin') {
      return next()
    }

    const candidate = req.params[fieldName] ?? req.body[fieldName] ?? req.query[fieldName]
    const tenantId = candidate == null ? null : Number(candidate)

    if (!tenantId || Number.isNaN(tenantId)) {
      return res.status(400).json({ message: 'Tenant identifier is required' })
    }

    if (tenantId !== req.user.institutionId) {
      return res.status(403).json({ message: 'Forbidden: tenant mismatch' })
    }

    return next()
  }
}
