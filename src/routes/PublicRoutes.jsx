import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'
import LoginPage from '../pages/Login.jsx'
import ActivateAccountPage from '../pages/ActivateAccount.jsx'
import ForgotPasswordPage from '../pages/ForgotPassword.jsx'
import ResetPasswordPage from '../pages/ResetPassword.jsx'

export default function PublicRoutes() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="loading-card">Loading authentication...</div>
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  if (location.pathname === '/activate-account') {
    return <ActivateAccountPage />
  }

  if (location.pathname === '/forgot-password') {
    return <ForgotPasswordPage />
  }

  if (location.pathname === '/reset-password') {
    return <ResetPasswordPage />
  }

  return <LoginPage />
}
