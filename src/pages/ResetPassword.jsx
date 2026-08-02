import { useState } from 'react'
import AuthenticationView from '../authentication/AuthenticationView.jsx'

export default function ResetPasswordPage() {
  const [mode, setMode] = useState('reset-password')

  return (
    <AuthenticationView
      mode={mode}
      onModeChange={setMode}
      onAuthenticated={() => {}}
    />
  )
}
