import AuthenticationView from '../authentication/AuthenticationView.jsx'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'

export default function LoginPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  if (user) {
    navigate('/dashboard', { replace: true })
    return null
  }

  return (
    <AuthenticationView
      mode="login"
      onModeChange={(nextMode) => {
        if (nextMode === 'login') {
          navigate('/login', { replace: true })
        } else if (nextMode === 'register') {
          navigate('/activate-account', { replace: true })
        } else if (nextMode === 'forgot-password') {
          navigate('/forgot-password', { replace: true })
        }
      }}
      onAuthenticated={() => navigate('/dashboard', { replace: true })}
    />
  )
}
