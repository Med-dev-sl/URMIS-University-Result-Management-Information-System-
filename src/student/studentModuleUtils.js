export function getSectionById(sections, activeSection) {
  return sections.find((section) => section.id === activeSection) || sections[0]
}

export function summarizeRegisteredCourses(courses) {
  const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0)
  const activeCount = courses.filter((course) => course.status === 'Registered').length
  const pendingCount = courses.filter((course) => course.status === 'Pending').length

  return {
    totalCredits,
    activeCount,
    pendingCount,
  }
}

export function buildProgressTrend(results) {
  return results.slice(0, 6).map((result) => ({
    ...result,
    height: Math.min(100, 55 + result.marks * 0.4),
  }))
}
