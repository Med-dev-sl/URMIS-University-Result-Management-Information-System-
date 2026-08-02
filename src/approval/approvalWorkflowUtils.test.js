import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTimeline, getNextStage, summarizeApprovalQueue } from './approvalWorkflowUtils.js'

test('summarises approval queue statuses', () => {
  const summary = summarizeApprovalQueue([
    { status: 'Pending' },
    { status: 'Pending' },
    { status: 'Approved' },
    { status: 'Rejected' },
    { status: 'Returned' },
  ])

  assert.deepEqual(summary, { pending: 2, approved: 1, rejected: 1, returned: 1 })
})

test('advances approval stage correctly', () => {
  assert.equal(getNextStage('Lecturer'), 'Head of Department')
  assert.equal(getNextStage('Published'), 'Published')
})

test('builds a timeline for the selected approval item', () => {
  const timeline = buildTimeline({ student: 'Amina', course: 'AI', currentStage: 'Dean', comment: 'Needs review', updatedAt: '2026-08-02', submittedAt: '2026-08-01' })
  assert.equal(timeline.length, 2)
  assert.equal(timeline[1].title, 'Dean')
})
