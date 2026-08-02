import test from 'node:test'
import assert from 'node:assert/strict'
import { buildSessionFromIdentity, completeActivation, getPermissionsForRole, validateActivation } from './authMockService.js'

test('valid activation payload returns a pending activation session', () => {
  const result = validateActivation({
    universityId: 'greenfield',
    accountType: 'student',
    identityType: 'student',
    identityValue: 'STU-1001',
    token: 'TOKEN-1002',
  })

  assert.equal(result.success, true)
  assert.equal(result.session.accountStatus, 'pending_activation')
  assert.equal(result.session.role, 'student')
})

test('role permissions include university admin management scope', () => {
  const permissions = getPermissionsForRole('university_admin')
  assert.ok(permissions.includes('manage_staff'))
  assert.ok(permissions.includes('manage_students'))
})

test('login payload builds a session with the selected university context', () => {
  const session = buildSessionFromIdentity({
    universityId: 'greenfield',
    universityEmail: 'student@greenfield.edu',
    role: 'student',
    accountStatus: 'active',
  })

  assert.equal(session.universityId, 'greenfield')
  assert.equal(session.role, 'student')
  assert.equal(session.accountStatus, 'active')
})

test('account activation completion succeeds when the password is strong enough', () => {
  const result = completeActivation({ userId: 'student-1001', password: 'StrongPass123!' })
  assert.equal(result.success, true)
  assert.equal(result.message, 'Account activation completed successfully.')
})
