import test from 'node:test'
import assert from 'node:assert/strict'
import { buildScorePreview, getAssessmentTypeOptions, summarizeAssessments } from './assessmentModuleUtils.js'

test('returns the full assessment type catalog', () => {
  const types = getAssessmentTypeOptions()
  assert.ok(types.includes('Midterm'))
  assert.ok(types.includes('Final Examination'))
})

test('summarizes assessment weights and statuses', () => {
  const summary = summarizeAssessments([
    { weight: 10, status: 'Approved' },
    { weight: 15, status: 'Draft' },
    { weight: 5, status: 'Pending' },
  ])
  assert.equal(summary.totalWeight, 30)
  assert.equal(summary.approved, 1)
  assert.equal(summary.draft, 1)
})

test('builds grade previews from score entries', () => {
  const preview = buildScorePreview([{ score: 88 }, { score: 45 }])
  assert.equal(preview[0].preview, 'A')
  assert.equal(preview[1].preview, 'F')
})
