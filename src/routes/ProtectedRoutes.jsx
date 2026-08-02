import { Navigate, Outlet, useLocation } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout.jsx'
import { useAuth } from '../auth/useAuth.js'

export default function ProtectedRoutes() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="loading-card">Loading dashboard...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  )
}
