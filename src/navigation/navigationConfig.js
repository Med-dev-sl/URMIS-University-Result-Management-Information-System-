import { permissions } from '../permissions/permissions.js'

export const sidebarGroups = [
  {
    id: 'overview',
    label: 'Overview',
    items: [
      { id: 'dashboard', title: 'Dashboard', icon: '📊', route: '/dashboard' },
    ],
  },
  {
    id: 'academic-management',
    label: 'Academic Management',
    items: [
      { id: 'academics', title: 'Academic structure', icon: '🏛️', route: '/dashboard/academics', permission: permissions.SYSTEM_VIEW },
    ],
  },
  {
    id: 'user-management',
    label: 'User Management',
    items: [
      { id: 'students', title: 'Students', icon: '🎓', route: '/dashboard/students', permission: permissions.STUDENT_VIEW },
      { id: 'student-profile', title: 'Student profile', icon: '👤', route: '/dashboard/student', permission: permissions.PROFILE_VIEW },
      { id: 'users', title: 'Users', icon: '👥', route: '/dashboard/users', permission: permissions.SYSTEM_VIEW },
    ],
  },
  {
    id: 'teaching-learning',
    label: 'Teaching & Learning',
    items: [
      { id: 'lecturer', title: 'Lecturer', icon: '👨‍🏫', route: '/dashboard/lecturer', permission: permissions.RESULT_VIEW },
      { id: 'assessment', title: 'Assessment', icon: '📝', route: '/dashboard/assessment', permission: permissions.ASSESSMENT_VIEW },
      { id: 'registration', title: 'Registration', icon: '🧑‍🎓', route: '/dashboard/registration', permission: permissions.REGISTRATION_VIEW },
    ],
  },
  {
    id: 'result-management',
    label: 'Result Management',
    items: [
      { id: 'results', title: 'Results', icon: '📈', route: '/dashboard/results', permission: permissions.RESULT_VIEW },
      { id: 'approval', title: 'Approval', icon: '✅', route: '/dashboard/approval', permission: permissions.RESULT_APPROVE },
    ],
  },
  {
    id: 'academic-records',
    label: 'Academic Records',
    items: [
      { id: 'documents', title: 'Documents', icon: '📁', route: '/dashboard/documents', permission: permissions.DOCUMENT_VIEW },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    items: [
      { id: 'reports', title: 'Reports', icon: '📊', route: '/dashboard/reports', permission: permissions.REPORT_VIEW },
    ],
  },
  {
    id: 'communication',
    label: 'Communication',
    items: [
      { id: 'communication', title: 'Communication', icon: '💬', route: '/dashboard/communication', permission: permissions.NOTIFICATION_VIEW },
    ],
  },
  {
    id: 'system-administration',
    label: 'System Administration',
    items: [
      { id: 'platform', title: 'Platform', icon: '⚙️', route: '/dashboard/platform', permission: permissions.SYSTEM_VIEW },
      { id: 'university', title: 'University', icon: '🏫', route: '/dashboard/university', permission: permissions.SYSTEM_VIEW },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    items: [
      { id: 'profile', title: 'My Profile', icon: '👤', route: '/dashboard/profile', permission: permissions.PROFILE_VIEW },
      { id: 'settings', title: 'Settings', icon: '⚙️', route: '/dashboard/settings', permission: permissions.SETTINGS_VIEW },
    ],
  },
]

export function getVisibleSidebarGroups(user) {
  return sidebarGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (!item.permission) return true
        if (!user?.permissions) return false
        return user.permissions.includes(item.permission)
      }),
    }))
    .filter((group) => group.items.length)
}

export function getActiveSidebarRoute(pathname) {
  const normalized = pathname.replace(/\/+$|\/\//g, '/')
  for (const group of sidebarGroups) {
    for (const item of group.items) {
      if (normalized === item.route || (item.route !== '/dashboard' && normalized.startsWith(item.route))) {
        return item
      }
    }
  }
  return sidebarGroups[0].items[0]
}
