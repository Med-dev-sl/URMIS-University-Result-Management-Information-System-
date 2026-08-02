export function summarizeLeadershipOverview(items) {
  const activeStatuses = new Set(['Pending', 'In review', 'Escalated'])

  return {
    pendingApprovals: items.filter((item) => item.type === 'Approval' && item.status === 'Pending').length,
    graduationReviews: items.filter((item) => item.type === 'Graduation').length,
    complaints: items.filter((item) => item.type === 'Complaint').length,
    totalOpenItems: items.filter((item) => activeStatuses.has(item.status)).length,
  }
}
