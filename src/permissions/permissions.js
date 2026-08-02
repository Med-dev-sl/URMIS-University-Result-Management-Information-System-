export const permissions = {
  STUDENT_CREATE: 'student:create',
  STUDENT_VIEW: 'student:view',
  RESULT_ENTER: 'result:create',
  RESULT_VIEW: 'result:view',
  RESULT_APPROVE: 'result:approve',
  REPORT_VIEW: 'report:view',
  USER_MANAGE: 'user:manage',
  PROFILE_VIEW: 'profile:view',
  COURSE_CREATE: 'course:create',
  STAFF_CREATE: 'staff:create',
  UNIVERSITY_CREATE: 'university:create',
  SYSTEM_VIEW: 'system:view',
}

export function hasPermission(user, permission) {
  if (!user) return false
  const granted = user.permissions || []
  return granted.includes(permission)
}
