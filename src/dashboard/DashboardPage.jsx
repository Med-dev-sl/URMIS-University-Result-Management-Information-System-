import DashboardView from './DashboardView.jsx'
import { useAuth } from '../auth/useAuth.js'

const emptyDashboard = {
  stats: [],
  students: [],
  recentResults: [],
}

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <DashboardView
      dashboard={emptyDashboard}
      user={user}
      onViewChange={() => {}}
      onShowError={() => {}}
    />
  )
}
