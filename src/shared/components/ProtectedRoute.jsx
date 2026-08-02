import { useAuth } from '../context/useAuth.js'

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="loading-card">Checking session…</div>
  }

  if (!user) {
    return <div className="loading-card">Please sign in to continue.</div>
  }

  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    return <div className="loading-card">You do not have permission to view this area.</div>
  }

  return children
}
