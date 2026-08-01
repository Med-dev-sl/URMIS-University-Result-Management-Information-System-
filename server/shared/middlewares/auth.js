import jwt from 'jsonwebtoken'

const accessSecret = process.env.JWT_SECRET || 'urmis-access-secret'

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token missing' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = jwt.verify(token, accessSecret)
    req.user = {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
      institutionId: payload.institutionId,
    }
    return next()
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role' })
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
