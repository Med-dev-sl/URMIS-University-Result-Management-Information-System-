export function summarizeReportOverview(items) {
  return {
    totalReports: items.length,
    activeReports: items.filter((item) => item.status === 'Ready').length,
    flaggedReports: items.filter((item) => item.status === 'Needs review').length,
    archiveCount: items.filter((item) => item.status === 'Archived').length,
  }
}

export function getReportLabel(section) {
  const labels = {
    students: 'Students',
    courses: 'Courses',
    departments: 'Departments',
    faculties: 'Faculties',
    results: 'Results',
    graduation: 'Graduation',
    carryOver: 'Carry Over',
    probation: 'Probation',
    performance: 'Performance',
    teachingLoad: 'Teaching Load',
    auditLogs: 'Audit Logs',
  }

  return labels[section] || section
}
