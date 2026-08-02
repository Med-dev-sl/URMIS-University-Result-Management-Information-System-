import { useState } from 'react'
import AuthenticationView from '../authentication/AuthenticationView.jsx'

export default function ForgotPasswordPage() {
  const [mode, setMode] = useState('forgot-password')

  return (
    <AuthenticationView
      mode={mode}
      onModeChange={setMode}
      onAuthenticated={() => {}}
    />
  )
}
