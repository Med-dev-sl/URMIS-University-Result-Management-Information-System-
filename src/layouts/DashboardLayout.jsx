import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from '../shared/components/Sidebar.jsx'
import Topbar from '../shared/components/Topbar.jsx'
import { useAuth } from '../auth/useAuth.js'
import { getVisibleSidebarGroups, getActiveSidebarRoute } from '../navigation/navigationConfig.js'

export default function DashboardLayout({ children }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const sidebarGroups = getVisibleSidebarGroups(user)
  const activeItem = getActiveSidebarRoute(location.pathname)

  const handleSelectView = (route) => {
    if (route === '/dashboard/logout') {
      signOut()
      return
    }
    navigate(route)
  }

  return (
    <main className="dashboard-shell" aria-label="URMIS dashboard">
      <Sidebar viewGroups={sidebarGroups} activeRoute={activeItem?.route || '/dashboard'} onSelectRoute={handleSelectView} />
      <section className="main-panel">
        <Topbar activeView={activeItem?.title || 'Dashboard'} user={user} onRefresh={() => {}} onSignOut={signOut} />
        <div className="content-panel">
          {children || <Outlet />}
        </div>
      </section>
    </main>
  )
}
