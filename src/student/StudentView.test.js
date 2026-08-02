import test from 'node:test'
import assert from 'node:assert/strict'
import { getSectionById, summarizeRegisteredCourses, buildProgressTrend } from './studentModuleUtils.js'

test('returns the requested student section', () => {
  const sections = [{ id: 'dashboard' }, { id: 'results' }]
  assert.equal(getSectionById(sections, 'results').id, 'results')
})

test('summarizes registered courses', () => {
  const summary = summarizeRegisteredCourses([
    { credits: 3, status: 'Registered' },
    { credits: 2, status: 'Pending' },
  ])
  assert.equal(summary.totalCredits, 5)
  assert.equal(summary.activeCount, 1)
  assert.equal(summary.pendingCount, 1)
})

test('builds progress trend entries', () => {
  const trend = buildProgressTrend([{ marks: 80 }, { marks: 90 }])
  assert.equal(trend.length, 2)
  assert.ok(trend[0].height > 0)
})
