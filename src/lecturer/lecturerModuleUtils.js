export function getSectionById(sections, activeSection) {
  return sections.find((section) => section.id === activeSection) || sections[0]
}

export function getCourseSummary(courses) {
  return {
    totalCourses: courses.length,
    activeAssessments: courses.filter((course) => course.assessments > 0).length,
    pendingResults: courses.filter((course) => course.pendingResults > 0).length,
  }
}

export function getAssessmentStats(results) {
  return {
    submitted: results.filter((item) => item.status === 'Submitted').length,
    draft: results.filter((item) => item.status === 'Draft').length,
    pending: results.filter((item) => item.status === 'Pending').length,
  }
}
