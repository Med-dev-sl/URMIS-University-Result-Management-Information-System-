import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'
import { hasPermission } from '../permissions/permissions.js'

export default function RouteGuard({ children, requireAuth = true, permission }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="loading-card">Checking your session...</div>
  }

  if (requireAuth && !user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (permission) {
    const permissionList = Array.isArray(permission) ? permission : [permission]
    const hasAnyPermission = permissionList.some((perm) => hasPermission(user, perm))
    if (!hasAnyPermission) {
      return <Navigate to="/unauthorized" replace />
    }
  }

  return children
}
