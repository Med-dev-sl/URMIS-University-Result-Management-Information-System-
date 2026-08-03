import { permissions } from '../permissions/permissions.js'

export const sidebarGroups = [
  {
    id: 'overview',
    label: 'Dashboard',
    items: [
      { id: 'dashboard', title: 'Dashboard', icon: '📊', route: '/dashboard' },
    ],
  },
  {
    id: 'platform-management',
    label: 'Platform Management',
    items: [
      { id: 'platform-universities', title: 'Universities', icon: '🏫', route: '/dashboard/system/universities', permission: permissions.SYSTEM_MANAGE },
      { id: 'platform-university-administrators', title: 'University Administrators', icon: '👥', route: '/dashboard/system/university-administrators', permission: permissions.SYSTEM_MANAGE },
    ],
  },
  {
    id: 'user-access-management',
    label: 'User & Access Management',
    items: [
      { id: 'platform-users', title: 'Platform Users', icon: '👤', route: '/dashboard/system/users', permission: permissions.SYSTEM_MANAGE },
      { id: 'roles-permissions', title: 'Roles & Permissions', icon: '🔐', route: '/dashboard/system/roles-permissions', permission: permissions.SYSTEM_MANAGE },
    ],
  },
  {
    id: 'subscription-management',
    label: 'Subscription Management',
    items: [
      { id: 'subscription-plans', title: 'Subscription Plans', icon: '💳', route: '/dashboard/system/subscriptions/plans', permission: permissions.SYSTEM_MANAGE },
      { id: 'university-subscriptions', title: 'University Subscriptions', icon: '🏛️', route: '/dashboard/system/subscriptions/universities', permission: permissions.SYSTEM_MANAGE },
      { id: 'billing-payments', title: 'Billing & Payments', icon: '🧾', route: '/dashboard/system/subscriptions/billing', permission: permissions.SYSTEM_MANAGE },
    ],
  },
  {
    id: 'reports-analytics',
    label: 'Reports & Analytics',
    items: [
      { id: 'platform-reports', title: 'Platform Reports', icon: '📈', route: '/dashboard/system/reports/platform', permission: permissions.SYSTEM_MANAGE },
      { id: 'usage-analytics', title: 'Usage Analytics', icon: '📊', route: '/dashboard/system/reports/usage', permission: permissions.SYSTEM_MANAGE },
    ],
  },
  {
    id: 'security-monitoring',
    label: 'Security & Monitoring',
    items: [
      { id: 'audit-logs', title: 'Audit Logs', icon: '🧾', route: '/dashboard/system/audit-logs', permission: permissions.SYSTEM_MANAGE },
      { id: 'login-activities', title: 'Login Activities', icon: '🔐', route: '/dashboard/system/audit-logs/login-activities', permission: permissions.SYSTEM_MANAGE },
      { id: 'security-alerts', title: 'Security Alerts', icon: '🚨', route: '/dashboard/system/monitoring/security-alerts', permission: permissions.SYSTEM_MANAGE },
      { id: 'system-monitoring', title: 'System Monitoring', icon: '🖥️', route: '/dashboard/system/monitoring', permission: permissions.SYSTEM_MANAGE },
    ],
  },
  {
    id: 'system-configuration',
    label: 'System Configuration',
    items: [
      { id: 'global-settings', title: 'Global Settings', icon: '⚙️', route: '/dashboard/system/settings/global', permission: permissions.SYSTEM_MANAGE },
      { id: 'authentication-settings', title: 'Authentication Settings', icon: '🔒', route: '/dashboard/system/settings/authentication', permission: permissions.SYSTEM_MANAGE },
      { id: 'notification-settings', title: 'Notification Settings', icon: '🔔', route: '/dashboard/system/settings/notification', permission: permissions.SYSTEM_MANAGE },
    ],
  },
  {
    id: 'support',
    label: 'Support',
    items: [
      { id: 'help-documentation', title: 'Help & Documentation', icon: '📚', route: '/dashboard/system/help', permission: permissions.SYSTEM_MANAGE },
      { id: 'system-information', title: 'System Information', icon: 'ℹ️', route: '/dashboard/system/info', permission: permissions.SYSTEM_MANAGE },
    ],
  },
  {
    id: 'my-account',
    label: 'My Account',
    items: [
      { id: 'profile', title: 'Profile', icon: '👤', route: '/dashboard/profile', permission: permissions.PROFILE_VIEW },
      { id: 'change-password', title: 'Change Password', icon: '🔑', route: '/dashboard/profile', permission: permissions.PROFILE_VIEW },
      { id: 'sign-out', title: 'Logout', icon: '🚪', route: '/dashboard/logout' },
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
        const permissionsToCheck = Array.isArray(item.permission) ? item.permission : [item.permission]
        return permissionsToCheck.some((permission) => user.permissions.includes(permission))
      }),
    }))
    .filter((group) => group.items.length)
}

export function getActiveSidebarRoute(pathname) {
  const normalized = pathname.replace(/\/+$|\/\//g, '/')
  let bestMatch = null

  for (const group of sidebarGroups) {
    for (const item of group.items) {
      if (normalized === item.route || (item.route !== '/dashboard' && normalized.startsWith(item.route))) {
        if (!bestMatch || item.route.length > bestMatch.route.length) {
          bestMatch = item
        }
      }
    }
  }

  return bestMatch || sidebarGroups[0].items[0]
}
