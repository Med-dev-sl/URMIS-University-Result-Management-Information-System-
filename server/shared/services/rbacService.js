import prisma from '../../prisma.js'

const ROLE_ALIASES = {
  'super admin': 'super_admin',
  'super-admin': 'super_admin',
  'super_admin': 'super_admin',
  'platform admin': 'super_admin',
  'platform-admin': 'super_admin',
  'platform_admin': 'super_admin',
  'platform administrator': 'super_admin',
  'platform-administrator': 'super_admin',
  admin: 'admin',
  'examination officer': 'examination_officer',
  'examination-officer': 'examination_officer',
  examination_officer: 'examination_officer',
  dean: 'dean',
  hod: 'hod',
  lecturer: 'lecturer',
  student: 'student',
  staff: 'admin',
}

export const ROLE_LABELS = {
  super_admin: 'Platform Administrator',
  admin: 'Admin',
  examination_officer: 'Examination Officer',
  dean: 'Dean',
  hod: 'HOD',
  lecturer: 'Lecturer',
  student: 'Student',
}

export const DEFAULT_ROLE_PERMISSIONS = {
  super_admin: [
    'manage_users',
    'manage_roles',
    'manage_permissions',
    'manage_system',
    'manage_settings',
    'view_reports',
  ],
  admin: [
    'manage_users',
    'manage_roles',
    'manage_permissions',
    'manage_system',
    'manage_settings',
    'view_reports',
  ],
  examination_officer: [
    'manage_assessments',
    'manage_results',
    'manage_registrations',
    'view_students',
    'view_reports',
  ],
  dean: [
    'manage_assessments',
    'manage_results',
    'view_students',
    'view_reports',
  ],
  hod: [
    'manage_assessments',
    'view_students',
    'manage_registrations',
    'view_reports',
  ],
  lecturer: [
    'manage_assessments',
    'view_students',
    'manage_results',
    'manage_documents',
  ],
  student: [
    'view_own_profile',
    'view_own_results',
    'view_own_documents',
    'view_own_registration',
  ],
}

export function normalizeRoleName(role) {
  if (!role) {
    return 'student'
  }

  const normalized = String(role).trim().toLowerCase()
  return ROLE_ALIASES[normalized] || normalized
}

export function getRoleLabel(role) {
  return ROLE_LABELS[normalizeRoleName(role)] || String(role || 'student')
}

async function ensureRbacSchema() {
  try {
    const userModel = await prisma.$queryRawUnsafe("SELECT name FROM sqlite_master WHERE type='table' AND name='User'")
    if (!userModel.length) {
      return
    }
  } catch {
    return
  }

  try {
    const columns = await prisma.$queryRawUnsafe("PRAGMA table_info('User')")
    const names = new Set(columns.map((column) => column.name))
    const additions = [
      ['isSuspended', 'BOOLEAN NOT NULL DEFAULT 0'],
      ['isLocked', 'BOOLEAN NOT NULL DEFAULT 0'],
      ['mustChangePassword', 'BOOLEAN NOT NULL DEFAULT 0'],
      ['lockedAt', 'DATETIME'],
      ['suspendedAt', 'DATETIME'],
      ['lastPasswordChange', 'DATETIME'],
      ['updated_at', 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP'],
    ]

    for (const [name] of additions) {
      if (!names.has(name)) {
        await prisma.$executeRawUnsafe(`ALTER TABLE User ADD COLUMN ${name} ${name === 'updated_at' ? 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP' : 'BOOLEAN NOT NULL DEFAULT 0'}`)
      }
    }
  } catch {
    // Ignore schema errors and continue with defaults.
  }

  try {
    const rolePermissionTable = await prisma.$queryRawUnsafe("SELECT name FROM sqlite_master WHERE type='table' AND name='RolePermission'")
    if (!rolePermissionTable.length) {
      await prisma.$executeRawUnsafe("CREATE TABLE RolePermission (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, role TEXT NOT NULL, permission TEXT NOT NULL, granted BOOLEAN NOT NULL DEFAULT true, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)")
      await prisma.$executeRawUnsafe("CREATE UNIQUE INDEX RolePermission_role_permission_key ON RolePermission(role, permission)")
    }
  } catch {
    // Ignore schema errors and continue with defaults.
  }
}

export async function getEffectivePermissions(role) {
  const normalizedRole = normalizeRoleName(role)
  const defaultPermissions = DEFAULT_ROLE_PERMISSIONS[normalizedRole] || DEFAULT_ROLE_PERMISSIONS.student
  const permissions = new Set(defaultPermissions)

  await ensureRbacSchema()

  try {
    const overrides = await prisma.rolePermission.findMany({
      where: { role: normalizedRole },
      select: { permission: true, granted: true },
    })

    overrides.forEach((entry) => {
      if (entry.granted) {
        permissions.add(entry.permission)
      } else {
        permissions.delete(entry.permission)
      }
    })
  } catch {
    // Fall back to the defaults if the permission table is unavailable.
  }

  return Array.from(permissions).sort()
}

export async function attachUserContext(user) {
  await ensureRbacSchema()
  const normalizedRole = normalizeRoleName(user.role)
  const permissions = await getEffectivePermissions(normalizedRole)

  return {
    id: user.id,
    email: user.email,
    role: normalizedRole,
    institutionId: user.institutionId,
    isSuspended: Boolean(user.isSuspended),
    isLocked: Boolean(user.isLocked),
    mustChangePassword: Boolean(user.mustChangePassword),
    permissions,
  }
}

export function hasPermission(user, permission) {
  return Boolean(user?.permissions?.includes(permission))
}

export function listAvailableRoles() {
  return Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }))
}
