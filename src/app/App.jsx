import '../App.css'
import { AppProviders } from './providers.jsx'
import Router from './routes.jsx'

export default function App() {
  return (
    <AppProviders>
      <Router />
    </AppProviders>
  )
}
