import { useEffect, useState } from 'react'
import DashboardView from './DashboardView.jsx'
import { useAuth } from '../auth/useAuth.js'

const emptyDashboard = {
  stats: [],
  students: [],
  recentResults: [],
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [dashboard, setDashboard] = useState(emptyDashboard)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const loadDashboard = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await fetch('/api/dashboard')
        if (!response.ok) {
          const body = await response.json().catch(() => ({}))
          throw new Error(body.message || 'Unable to load dashboard data.')
        }

        const data = await response.json()
        if (active) {
          setDashboard(data)
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Unable to load dashboard data.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadDashboard()
    return () => {
      active = false
    }
  }, [])

  return (
    <DashboardView
      dashboard={dashboard}
      user={user}
      onViewChange={() => {}}
      onShowError={(message) => setError(message)}
      loading={loading}
      error={error}
    />
  )
}
