export function summarizeDocumentMetrics(items) {
  return {
    totalDocuments: items.length,
    uploadedToday: items.filter((item) => item.status === 'Uploaded today').length,
    pendingReview: items.filter((item) => item.status === 'Pending review').length,
    latestVersion: items[0]?.version || '1.0',
  }
}

export function getCategoryLabel(category) {
  const labels = {
    courseOutlines: 'Course Outlines',
    pastPapers: 'Past Papers',
    academicCalendar: 'Academic Calendar',
    policies: 'Policies',
    certificates: 'Certificates',
    transcripts: 'Transcripts',
  }

  return labels[category] || category
}
