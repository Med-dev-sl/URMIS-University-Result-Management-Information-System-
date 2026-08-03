import { permissions } from './permissions.js'

const ROLE_ALIASES = {
  admin: 'admin',
  super_admin: 'super_admin',
  superadmin: 'super_admin',
  'super admin': 'super_admin',
  'super-admin': 'super_admin',
  platform_admin: 'super_admin',
  'platform admin': 'super_admin',
  'platform-admin': 'super_admin',
  platform_administrator: 'super_admin',
  'platform administrator': 'super_admin',
  'platform-administrator': 'super_admin',
  university_admin: 'university_admin',
  university_administrator: 'university_admin',
  'university admin': 'university_admin',
  universityadministrator: 'university_admin',
  'university-administrator': 'university_admin',
  lecturer: 'lecturer',
  hod: 'hod',
  dean: 'dean',
  student: 'student',
  examination_officer: 'examination_officer',
  exam_officer: 'examination_officer',
  'examination officer': 'examination_officer',
  'exam officer': 'examination_officer',
  staff: 'staff',
}

export const ROLE_LABELS = {
  super_admin: 'Platform Administrator',
  admin: 'Admin',
  university_admin: 'University Administrator',
  lecturer: 'Lecturer',
  hod: 'HOD',
  dean: 'Dean',
  student: 'Student',
  examination_officer: 'Examination Officer',
  staff: 'Staff',
}

export const ROLE_PERMISSIONS = {
  ADMIN: [
    permissions.USER_MANAGE,
    permissions.UNIVERSITY_CREATE,
    permissions.SYSTEM_VIEW,
    permissions.SYSTEM_MANAGE,
    permissions.REPORT_VIEW,
    permissions.SETTINGS_VIEW,
    permissions.PROFILE_VIEW,
  ],
  SUPER_ADMIN: [
    permissions.USER_MANAGE,
    permissions.UNIVERSITY_CREATE,
    permissions.SYSTEM_VIEW,
    permissions.SYSTEM_MANAGE,
    permissions.REPORT_VIEW,
    permissions.SETTINGS_VIEW,
    permissions.PROFILE_VIEW,
  ],
  UNIVERSITY_ADMIN: [
    permissions.STUDENT_CREATE,
    permissions.STUDENT_VIEW,
    permissions.STAFF_CREATE,
    permissions.COURSE_CREATE,
    permissions.COURSE_VIEW,
    permissions.STAFF_VIEW,
    permissions.RESULT_VIEW,
    permissions.REPORT_VIEW,
    permissions.ASSESSMENT_VIEW,
    permissions.PROFILE_VIEW,
    permissions.DEPARTMENT_VIEW,
    permissions.FACULTY_VIEW,
    permissions.NOTIFICATION_VIEW,
    permissions.REGISTRATION_VIEW,
    permissions.SETTINGS_VIEW,
  ],
  LECTURER: [
    permissions.RESULT_ENTER,
    permissions.STUDENT_VIEW,
    permissions.RESULT_VIEW,
    permissions.ASSESSMENT_VIEW,
    permissions.LECTURER_VIEW,
    permissions.PROFILE_VIEW,
    permissions.COURSE_VIEW,
    permissions.REPORT_VIEW,
  ],
  HOD: [
    permissions.RESULT_VIEW,
    permissions.RESULT_APPROVE,
    permissions.HOD_VIEW,
    permissions.REPORT_VIEW,
    permissions.PROFILE_VIEW,
    permissions.STUDENT_VIEW,
    permissions.REGISTRATION_VIEW,
    permissions.COURSE_VIEW,
    permissions.STAFF_VIEW,
    permissions.ASSESSMENT_VIEW,
    permissions.DEPARTMENT_VIEW,
    permissions.FACULTY_VIEW,
  ],
  DEAN: [
    permissions.RESULT_APPROVE,
    permissions.RESULT_REVIEW,
    permissions.RESULT_VIEW,
    permissions.REPORT_VIEW,
    permissions.DEAN_VIEW,
    permissions.FACULTY_VIEW,
    permissions.PROFILE_VIEW,
    permissions.STUDENT_VIEW,
    permissions.REGISTRATION_VIEW,
    permissions.COURSE_VIEW,
    permissions.STAFF_VIEW,
    permissions.DEPARTMENT_VIEW,
    permissions.ASSESSMENT_VIEW,
  ],
  STUDENT: [
    permissions.STUDENT_PORTAL_VIEW,
    permissions.PROFILE_VIEW,
    permissions.RESULT_VIEW,
    permissions.REGISTRATION_VIEW,
    permissions.NOTIFICATION_VIEW,
    permissions.DOCUMENT_VIEW,
    permissions.REPORT_VIEW,
  ],
  EXAMINATION_OFFICER: [
    permissions.EXAM_MANAGE,
    permissions.RESULT_VIEW,
    permissions.RESULT_REVIEW,
    permissions.REPORT_VIEW,
    permissions.PROFILE_VIEW,
    permissions.FACULTY_VIEW,
    permissions.DEPARTMENT_VIEW,
  ],
  STAFF: [
    permissions.STUDENT_VIEW,
    permissions.RESULT_VIEW,
    permissions.PROFILE_VIEW,
    permissions.COURSE_CREATE,
    permissions.STAFF_CREATE,
  ],
}

export function normalizeRoleName(role) {
  if (!role) {
    return 'student'
  }

  const normalized = String(role).trim().toLowerCase().replace(/\s+/g, '_').replace(/-+/g, '_')
  return ROLE_ALIASES[normalized] || normalized
}

export function getRoleLabel(role) {
  return ROLE_LABELS[normalizeRoleName(role)] || String(role || 'student')
}

export function getRolePermissions(role) {
  const normalizedRole = normalizeRoleName(role)
  const normalizedKey = normalizedRole.toUpperCase()
  const aliases = {
    ADMIN: 'ADMIN',
    SUPER_ADMIN: 'SUPER_ADMIN',
    PLATFORM_ADMIN: 'SUPER_ADMIN',
    PLATFORM_ADMINISTRATOR: 'SUPER_ADMIN',
    UNIVERSITY_ADMIN: 'UNIVERSITY_ADMIN',
    LECTURER: 'LECTURER',
    HOD: 'HOD',
    DEAN: 'DEAN',
    STUDENT: 'STUDENT',
    EXAMINATION_OFFICER: 'EXAMINATION_OFFICER',
    STAFF: 'STAFF',
  }
  const key = aliases[normalizedKey] || normalizedKey
  return ROLE_PERMISSIONS[key] || []
}
