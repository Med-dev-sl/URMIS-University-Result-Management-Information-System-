import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../auth/AuthContext.jsx'
import { ToastProvider } from '../shared/components/ToastProvider.jsx'

export function AppProviders({ children }) {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastProvider>{children}</ToastProvider>
      </BrowserRouter>
    </AuthProvider>
  )
}
