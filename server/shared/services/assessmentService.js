export function calculateFinalMarks(marks, weights) {
  const totalWeight = weights.reduce((sum, item) => sum + Number(item.weight || 0), 0)

  if (!totalWeight) {
    return 0
  }

  const weightedTotal = weights.reduce((sum, item) => {
    const value = Number(marks[item.component] ?? 0)
    const weight = Number(item.weight || 0)
    return sum + (value * weight)
  }, 0)

  return Number((weightedTotal / totalWeight).toFixed(2))
}

export function deriveGrade(mark) {
  if (mark >= 70) return 'A'
  if (mark >= 60) return 'B'
  if (mark >= 50) return 'C'
  if (mark >= 40) return 'D'
  return 'F'
}
