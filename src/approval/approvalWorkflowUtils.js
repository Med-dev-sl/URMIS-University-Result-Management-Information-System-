export function summarizeApprovalQueue(items) {
  const pending = items.filter((item) => item.status === 'Pending').length
  const approved = items.filter((item) => item.status === 'Approved').length
  const rejected = items.filter((item) => item.status === 'Rejected').length
  const returned = items.filter((item) => item.status === 'Returned').length

  return { pending, approved, rejected, returned }
}

export function getNextStage(currentStage) {
  const stages = ['Lecturer', 'Head of Department', 'Dean', 'Examination Officer', 'Published']
  const index = stages.indexOf(currentStage)
  return index >= 0 && index < stages.length - 1 ? stages[index + 1] : currentStage
}

export function buildTimeline(item) {
  return [
    { id: 1, title: 'Submitted', detail: `${item.student} submitted the result for ${item.course}`, date: item.submittedAt },
    { id: 2, title: item.currentStage, detail: item.comment || 'Awaiting review', date: item.updatedAt },
  ]
}
