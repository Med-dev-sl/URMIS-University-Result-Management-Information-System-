import test from 'node:test'
import assert from 'node:assert/strict'
import { calculatePasswordStrength, getPasswordStrengthLabel } from './authService.js'

test('password strength returns strong for mixed complex passwords', () => {
  const result = calculatePasswordStrength('Admin@2026!')

  assert.equal(result.score, 4)
  assert.equal(getPasswordStrengthLabel('Admin@2026!'), 'Strong')
})

test('password strength returns weak for short simple input', () => {
  const result = calculatePasswordStrength('abc')

  assert.equal(result.score, 0)
  assert.equal(getPasswordStrengthLabel('abc'), 'Weak')
})
