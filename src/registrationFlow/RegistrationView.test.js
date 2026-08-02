import test from 'node:test'
import assert from 'node:assert/strict'
import { calculateCreditLoad, getRegistrationStatus, validateSelection } from './registrationModuleUtils.js'

test('returns registration status based on period flags', () => {
  assert.equal(getRegistrationStatus(true, false), 'Open Registration')
  assert.equal(getRegistrationStatus(false, true), 'Late Registration')
})

test('calculates total selected credits', () => {
  const total = calculateCreditLoad([{ credits: 3 }, { credits: 2 }, { credits: 4 }])
  assert.equal(total, 9)
})

test('validates credit and prerequisite constraints', () => {
  const result = validateSelection([{ credits: 20, prerequisite: null, prerequisiteMet: true }, { credits: 6, prerequisite: 'CSC301', prerequisiteMet: false }])
  assert.equal(result.creditLoad, 26)
  assert.equal(result.valid, false)
  assert.ok(result.errors.includes('Credit limit exceeded'))
  assert.ok(result.errors.includes('Prerequisite not satisfied'))
})
