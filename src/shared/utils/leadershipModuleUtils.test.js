import test from 'node:test'
import assert from 'node:assert/strict'
import { summarizeLeadershipOverview } from './leadershipModuleUtils.js'

test('summarizes leadership workload metrics', () => {
  const items = [
    { type: 'Approval', status: 'Pending' },
    { type: 'Approval', status: 'Approved' },
    { type: 'Graduation', status: 'Pending' },
    { type: 'Complaint', status: 'Escalated' },
  ]

  const summary = summarizeLeadershipOverview(items)

  assert.equal(summary.pendingApprovals, 1)
  assert.equal(summary.graduationReviews, 1)
  assert.equal(summary.complaints, 1)
  assert.equal(summary.totalOpenItems, 3)
})
