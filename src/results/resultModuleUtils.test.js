import test from 'node:test'
import assert from 'node:assert/strict'
import { calculateCgpa, calculateGpa, calculateGrade, detectCarryOvers, summarizeResultStats } from './resultModuleUtils.js'

test('calculates grade and GPA correctly', () => {
  assert.deepEqual(calculateGrade(82), { min: 80, grade: 'A', points: 4 })
  assert.deepEqual(calculateGpa([{ credits: 3, mark: 82 }, { credits: 2, mark: 70 }]), { gpa: 3.6, totalCredits: 5, totalPoints: 18 })
})

test('calculates CGPA from semester summaries', () => {
  assert.deepEqual(calculateCgpa([{ credits: 3, points: 12 }, { credits: 2, points: 6 }]), { cgpa: 3.6, totalCredits: 5, totalPoints: 18 })
})

test('detects carry over and summarizes statuses', () => {
  const carryOvers = detectCarryOvers([{ mark: 45, status: 'Pending' }, { mark: 74, status: 'Carry Over' }, { mark: 78, status: 'Published' }])
  assert.equal(carryOvers.length, 2)
  assert.deepEqual(summarizeResultStats([{ status: 'Published' }, { status: 'Pending' }, { status: 'Moderated' }, { status: 'Locked' }]), {
    published: 1,
    pending: 1,
    moderated: 1,
    locked: 1,
  })
})
