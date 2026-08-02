import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from '../shared/components/Sidebar.jsx'
import Topbar from '../shared/components/Topbar.jsx'
import { useAuth } from '../shared/context/useAuth.js'
import { hasPermission } from '../permissions/permissions.js'

const viewGroups = [
  {
    label: 'Overview',
    items: ['Dashboard', 'Students', 'Results', 'Reports', 'Settings'],
  },
]

const viewRouteMap = {
  Dashboard: '/dashboard',
  Students: '/dashboard/students',
  Results: '/dashboard/results',
  Reports: '/dashboard/reports',
  Settings: '/dashboard/settings',
}

export default function DashboardLayout({ children }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const visibleItems = viewGroups.flatMap((group) => group.items).filter((view) => {
    if (view === 'Dashboard') return true
    if (view === 'Students') return hasPermission(user, 'student:view')
    if (view === 'Results') return hasPermission(user, 'result:view')
    if (view === 'Reports') return hasPermission(user, 'report:view')
    if (view === 'Settings') return hasPermission(user, 'profile:view')
    return true
  })

  const filteredGroups = viewGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((view) => visibleItems.includes(view)),
    }))
    .filter((group) => group.items.length)

  const activeView = location.pathname.startsWith('/dashboard/students')
    ? 'Students'
    : location.pathname.startsWith('/dashboard/results')
      ? 'Results'
      : location.pathname.startsWith('/dashboard/reports')
        ? 'Reports'
        : location.pathname.startsWith('/dashboard/settings')
          ? 'Settings'
          : 'Dashboard'

  const handleSelectView = (view) => {
    navigate(viewRouteMap[view] || '/dashboard')
  }

  return (
    <main className="dashboard-shell" aria-label="URMIS dashboard">
      <Sidebar viewGroups={filteredGroups} activeView={activeView} onSelectView={handleSelectView} />
      <section className="main-panel">
        <Topbar activeView={activeView} user={user} onRefresh={() => {}} onSignOut={signOut} />
        <div className="content-panel">
          {children || <Outlet />}
        </div>
      </section>
    </main>
  )
}
