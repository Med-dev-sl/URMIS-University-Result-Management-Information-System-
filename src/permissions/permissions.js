export const permissions = {
  STUDENT_CREATE: 'student:create',
  STUDENT_VIEW: 'student:view',
  STUDENT_PORTAL_VIEW: 'student:portal:view',
  REGISTRATION_VIEW: 'registration:view',
  RESULT_ENTER: 'result:create',
  RESULT_VIEW: 'result:view',
  RESULT_APPROVE: 'result:approve',
  REPORT_VIEW: 'report:view',
  ASSESSMENT_VIEW: 'assessment:view',
  LECTURER_VIEW: 'lecturer:view',
  HOD_VIEW: 'hod:view',
  DEAN_VIEW: 'dean:view',
  USER_MANAGE: 'user:manage',
  PROFILE_VIEW: 'profile:view',
  SETTINGS_VIEW: 'settings:view',
  NOTIFICATION_VIEW: 'notification:view',
  COURSE_CREATE: 'course:create',
  COURSE_VIEW: 'course:view',
  STAFF_CREATE: 'staff:create',
  STAFF_VIEW: 'staff:view',
  UNIVERSITY_CREATE: 'university:create',
  SYSTEM_VIEW: 'system:view',
  DEPARTMENT_VIEW: 'department:view',
  FACULTY_VIEW: 'faculty:view',
  APPROVAL_MANAGE: 'approval:manage',
  DOCUMENT_VIEW: 'documents:view',
  EXAM_MANAGE: 'exams:manage',
  RESULT_REVIEW: 'result:review',
  STUDENT_MANAGE: 'student:manage',
  INVOICE_MANAGE: 'invoice:manage',
  FEE_VIEW: 'fee:view',
  SYSTEM_MANAGE: 'system:manage',
}

export function hasPermission(user, permission) {
  if (!user) return false
  const granted = user.permissions || []
  return granted.includes(permission)
}
