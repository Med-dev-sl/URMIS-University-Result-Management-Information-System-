import assert from 'node:assert/strict'
import { calculateFinalMarks } from './assessmentService.js'

const marks = {
  ca: 70,
  assignment: 80,
  practical: 60,
  exam: 90,
}

const weights = [
  { component: 'ca', weight: 30 },
  { component: 'assignment', weight: 20 },
  { component: 'practical', weight: 10 },
  { component: 'exam', weight: 40 },
]

const result = calculateFinalMarks(marks, weights)
assert.equal(result, 79)
console.log('assessmentService test passed', result)
