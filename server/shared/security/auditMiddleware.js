import { createAuditLog, isAuditLoggingUnavailable } from './auditService.js'

export function auditLogger(action) {
  return async (req, res, next) => {
    res.on('finish', async () => {
      try {
        await createAuditLog({
          institutionId: req.user?.institutionId ?? null,
          userId: req.user?.id ?? null,
          route: req.originalUrl,
          method: req.method,
          action,
          details: JSON.stringify({
            status: res.statusCode,
            query: req.query,
            body: req.body,
          }),
          ip: req.ip,
          userAgent: req.headers['user-agent'] ?? null,
        })
      } catch (error) {
        if (!isAuditLoggingUnavailable(error)) {
          console.error('Failed to write audit log:', error)
        }
      }
    })

    next()
  }
}
