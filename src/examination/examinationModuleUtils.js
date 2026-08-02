export function summarizeExaminationMetrics(items) {
  return {
    pendingResults: items.filter((item) => item.status === 'Pending review').length,
    publishedResults: items.filter((item) => item.status === 'Published').length,
    graduationCandidates: items.filter((item) => item.category === 'Graduation').length,
    transcriptProcessing: items.filter((item) => item.type === 'Transcript').length,
    certificateProcessing: items.filter((item) => item.type === 'Certificate').length,
    correctionRequests: items.filter((item) => item.type === 'Correction').length,
  }
}

export function getStatusTone(status) {
  switch (status) {
    case 'Published':
      return 'status-active'
    case 'Pending review':
      return 'status-pending'
    case 'Needs attention':
      return 'status-suspended'
    default:
      return 'muted'
  }
}
