export function getRegistrationStatus(open, late) {
  if (late) return 'Late Registration'
  if (open) return 'Open Registration'
  return 'Close Registration'
}

export function calculateCreditLoad(courses) {
  return courses.reduce((sum, course) => sum + course.credits, 0)
}

export function validateSelection(courses) {
  const creditLoad = calculateCreditLoad(courses)
  const hasPrerequisiteIssue = courses.some((course) => course.prerequisite && !course.prerequisiteMet)
  const errors = []

  if (creditLoad > 24) {
    errors.push('Credit limit exceeded')
  }

  if (hasPrerequisiteIssue) {
    errors.push('Prerequisite not satisfied')
  }

  return {
    creditLoad,
    errors,
    valid: errors.length === 0,
  }
}
