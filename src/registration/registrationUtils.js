export function getRegistrationStatusLabel(status) {
  switch (status) {
    case 'approved':
      return 'Approved'
    case 'rejected':
      return 'Rejected'
    case 'submitted':
    default:
      return 'Submitted'
  }
}

export function canApproveRegistration(role) {
  return role === 'admin' || role === 'hod' || role === 'exam_officer'
}

export function getRegistrationRoleHint(role) {
  if (role === 'student') {
    return {
      title: 'Submit your registration',
      description: 'Students submit course selections for the current registration window.',
      cta: 'Submit registration',
    }
  }

  return {
    title: 'Review pending registrations',
    description: 'Academic reviewers approve or reject student submissions for the active period.',
    cta: 'Review registrations',
  }
}

export function getSelectedCourseCreditUnits(courses, selectedIds = []) {
  if (!Array.isArray(courses)) return 0

  return courses.reduce((total, course) => {
    if (selectedIds.includes(course.id)) {
      return total + Number(course.credit_hours || 0)
    }
    return total
  }, 0)
}
