import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../auth/AuthContext.jsx'

export function AppProviders({ children }) {
  return (
    <AuthProvider>
      <BrowserRouter>{children}</BrowserRouter>
    </AuthProvider>
  )
}
