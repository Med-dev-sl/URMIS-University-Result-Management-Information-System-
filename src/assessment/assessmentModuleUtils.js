export function getAssessmentTypeOptions() {
  return [
    'Assignment',
    'Quiz',
    'Test',
    'Midterm',
    'Practical',
    'Final Examination',
  ]
}

export function summarizeAssessments(assessments) {
  const totalWeight = assessments.reduce((sum, item) => sum + item.weight, 0)
  const approved = assessments.filter((item) => item.status === 'Approved').length
  const draft = assessments.filter((item) => item.status === 'Draft').length

  return {
    totalWeight,
    approved,
    draft,
  }
}

export function buildScorePreview(entries) {
  return entries.map((entry) => ({
    ...entry,
    preview: entry.score >= 70 ? 'A' : entry.score >= 60 ? 'B' : entry.score >= 50 ? 'C' : 'F',
  }))
}
