const gradeScale = [
  { min: 80, grade: 'A', points: 4.0 },
  { min: 70, grade: 'B', points: 3.0 },
  { min: 60, grade: 'C', points: 2.0 },
  { min: 50, grade: 'D', points: 1.0 },
  { min: 0, grade: 'F', points: 0 },
]

export function calculateGrade(mark) {
  const match = gradeScale.find((entry) => mark >= entry.min)
  if (!match) return { grade: 'F', points: 0 }

  const { min, grade, points } = match
  return { min, grade, points }
}

export function calculateGpa(courses) {
  const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0)
  const totalPoints = courses.reduce((sum, course) => {
    const grade = calculateGrade(course.mark)
    return sum + (course.credits * grade.points)
  }, 0)

  return {
    gpa: totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : 0,
    totalCredits,
    totalPoints,
  }
}

export function calculateCgpa(semesterSummaries) {
  const totalCredits = semesterSummaries.reduce((sum, item) => sum + item.credits, 0)
  const totalPoints = semesterSummaries.reduce((sum, item) => sum + item.points, 0)

  return {
    cgpa: totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : 0,
    totalCredits,
    totalPoints,
  }
}

export function detectCarryOvers(results) {
  return results.filter((result) => result.mark < 50 || result.status === 'Carry Over')
}

export function summarizeResultStats(results) {
  const published = results.filter((result) => result.status === 'Published').length
  const pending = results.filter((result) => result.status === 'Pending').length
  const moderated = results.filter((result) => result.status === 'Moderated').length
  const locked = results.filter((result) => result.status === 'Locked').length

  return { published, pending, moderated, locked }
}
