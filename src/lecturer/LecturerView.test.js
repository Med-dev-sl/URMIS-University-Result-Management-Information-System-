import test from 'node:test'
import assert from 'node:assert/strict'
import { getAssessmentStats, getCourseSummary, getSectionById } from './lecturerModuleUtils.js'

test('returns a lecturer section by id', () => {
  const sections = [{ id: 'dashboard' }, { id: 'results' }]
  assert.equal(getSectionById(sections, 'results').id, 'results')
})

test('summarizes lecturer course load', () => {
  const summary = getCourseSummary([{ assessments: 2, pendingResults: 1 }, { assessments: 0, pendingResults: 0 }])
  assert.equal(summary.totalCourses, 2)
  assert.equal(summary.activeAssessments, 1)
  assert.equal(summary.pendingResults, 1)
})

test('counts assessment states', () => {
  const stats = getAssessmentStats([{ status: 'Submitted' }, { status: 'Draft' }, { status: 'Pending' }])
  assert.deepEqual(stats, { submitted: 1, draft: 1, pending: 1 })
})
