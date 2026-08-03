import { permissions } from './permissions.js'

export const ROLE_PERMISSIONS = {
  ADMIN: [
    permissions.USER_MANAGE,
    permissions.UNIVERSITY_CREATE,
    permissions.SYSTEM_VIEW,
    permissions.STUDENT_VIEW,
    permissions.RESULT_VIEW,
    permissions.RESULT_APPROVE,
    permissions.REPORT_VIEW,
    permissions.PROFILE_VIEW,
  ],
  SUPER_ADMIN: [
    permissions.USER_MANAGE,
    permissions.UNIVERSITY_CREATE,
    permissions.SYSTEM_VIEW,
    permissions.STUDENT_VIEW,
    permissions.RESULT_VIEW,
    permissions.RESULT_APPROVE,
    permissions.REPORT_VIEW,
    permissions.PROFILE_VIEW,
  ],
  PLATFORM_ADMIN: [
    permissions.USER_MANAGE,
    permissions.UNIVERSITY_CREATE,
    permissions.SYSTEM_VIEW,
    permissions.STUDENT_VIEW,
    permissions.RESULT_VIEW,
    permissions.RESULT_APPROVE,
    permissions.REPORT_VIEW,
    permissions.PROFILE_VIEW,
  ],
  UNIVERSITY_ADMIN: [
    permissions.STUDENT_CREATE,
    permissions.STUDENT_VIEW,
    permissions.STAFF_CREATE,
    permissions.COURSE_CREATE,
    permissions.RESULT_VIEW,
    permissions.RESULT_APPROVE,
    permissions.REPORT_VIEW,
    permissions.PROFILE_VIEW,
  ],
  LECTURER: [
    permissions.RESULT_ENTER,
    permissions.STUDENT_VIEW,
    permissions.RESULT_VIEW,
    permissions.PROFILE_VIEW,
  ],
  HOD: [
    permissions.RESULT_VIEW,
    permissions.RESULT_APPROVE,
    permissions.REPORT_VIEW,
    permissions.PROFILE_VIEW,
  ],
  DEAN: [
    permissions.RESULT_APPROVE,
    permissions.REPORT_VIEW,
    permissions.RESULT_VIEW,
    permissions.PROFILE_VIEW,
  ],
  STUDENT: [
    permissions.PROFILE_VIEW,
    permissions.RESULT_VIEW,
  ],
  EXAMINATION_OFFICER: [
    permissions.EXAM_MANAGE,
    permissions.RESULT_VIEW,
    permissions.RESULT_REVIEW,
    permissions.STUDENT_VIEW,
    permissions.REPORT_VIEW,
    permissions.PROFILE_VIEW,
  ],
  STAFF: [
    permissions.STUDENT_VIEW,
    permissions.RESULT_VIEW,
    permissions.PROFILE_VIEW,
    permissions.COURSE_CREATE,
    permissions.STAFF_CREATE,
  ],
}

export function getRolePermissions(role) {
  const normalizedRole = String(role || '').toLowerCase().replace(/\s+/g, '_')
  const normalizedKey = normalizedRole.toUpperCase()
  const aliases = {
    ADMIN: 'ADMIN',
    SUPER_ADMIN: 'SUPER_ADMIN',
    SUPERADMIN: 'SUPER_ADMIN',
    PLATFORM_ADMIN: 'PLATFORM_ADMIN',
    PLATFORM_ADMINISTRATOR: 'PLATFORM_ADMIN',
    UNIVERSITY_ADMIN: 'UNIVERSITY_ADMIN',
    UNIVERSITY_ADMINISTRATOR: 'UNIVERSITY_ADMIN',
    UNIVERSITYADMIN: 'UNIVERSITY_ADMIN',
    LECTURER: 'LECTURER',
    HOD: 'HOD',
    DEAN: 'DEAN',
    STUDENT: 'STUDENT',
    EXAMINATION_OFFICER: 'EXAMINATION_OFFICER',
    EXAM_OFFICER: 'EXAMINATION_OFFICER',
    STAFF: 'STAFF',
  }
  const key = aliases[normalizedKey] || normalizedKey
  return ROLE_PERMISSIONS[key] || []
}
