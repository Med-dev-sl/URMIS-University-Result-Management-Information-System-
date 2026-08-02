import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from '../shared/components/Sidebar.jsx'
import Topbar from '../shared/components/Topbar.jsx'
import { useAuth } from '../auth/useAuth.js'
import { hasPermission } from '../permissions/permissions.js'

const viewGroups = [
  {
    label: 'Overview',
    items: ['Dashboard', 'Students', 'Student', 'Lecturer', 'Assessment', 'Registration', 'Results', 'Reports', 'Settings'],
  },
  {
    label: 'Leadership',
    items: ['Dean', 'HOD'],
  },
  {
    label: 'Administration',
    items: ['Platform', 'University', 'Users', 'Academics'],
  },
]

const viewRouteMap = {
  Dashboard: '/dashboard',
  Students: '/dashboard/students',
  Student: '/dashboard/student',
  Lecturer: '/dashboard/lecturer',
  Assessment: '/dashboard/assessment',
  Registration: '/dashboard/registration',
  Dean: '/dashboard/dean',
  HOD: '/dashboard/hod',
  Results: '/dashboard/results',
  Reports: '/dashboard/reports',
  Settings: '/dashboard/settings',
  Platform: '/dashboard/platform',
  University: '/dashboard/university',
  Users: '/dashboard/users',
  Academics: '/dashboard/academics',
}

export default function DashboardLayout({ children }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const visibleItems = viewGroups.flatMap((group) => group.items).filter((view) => {
    if (view === 'Dashboard') return true
    if (view === 'Students') return hasPermission(user, 'student:view')
    if (view === 'Student') return hasPermission(user, 'profile:view')
    if (view === 'Lecturer') return hasPermission(user, 'result:view')
    if (view === 'Assessment') return hasPermission(user, 'result:view')
    if (view === 'Registration') return hasPermission(user, 'profile:view')
    if (view === 'Dean') return hasPermission(user, 'result:approve')
    if (view === 'HOD') return hasPermission(user, 'result:approve')
    if (view === 'Results') return hasPermission(user, 'result:view')
    if (view === 'Reports') return hasPermission(user, 'report:view')
    if (view === 'Settings') return hasPermission(user, 'profile:view')
    if (view === 'Platform') return hasPermission(user, 'system:view')
    if (view === 'University') return hasPermission(user, 'system:view')
    if (view === 'Users') return hasPermission(user, 'system:view')
    if (view === 'Academics') return hasPermission(user, 'system:view')
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
    : location.pathname.startsWith('/dashboard/student')
      ? 'Student'
      : location.pathname.startsWith('/dashboard/lecturer')
        ? 'Lecturer'
        : location.pathname.startsWith('/dashboard/assessment')
          ? 'Assessment'
          : location.pathname.startsWith('/dashboard/registration')
            ? 'Registration'
            : location.pathname.startsWith('/dashboard/dean')
              ? 'Dean'
              : location.pathname.startsWith('/dashboard/hod')
                ? 'HOD'
                : location.pathname.startsWith('/dashboard/results')
      ? 'Results'
      : location.pathname.startsWith('/dashboard/reports')
        ? 'Reports'
        : location.pathname.startsWith('/dashboard/settings')
          ? 'Settings'
          : location.pathname.startsWith('/dashboard/platform')
            ? 'Platform'
            : location.pathname.startsWith('/dashboard/users')
              ? 'Users'
              : location.pathname.startsWith('/dashboard/academics')
                ? 'Academics'
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
