import test from 'node:test'
import assert from 'node:assert/strict'
import { getRolePermissions } from '../src/permissions/roles.js'

test('maps university and examination roles to the expected permissions', () => {
  const universityAdminPermissions = getRolePermissions('university_administrator')
  const examOfficerPermissions = getRolePermissions('examination_officer')
  const staffPermissions = getRolePermissions('staff')

  assert.ok(universityAdminPermissions.includes('student:view'))
  assert.ok(universityAdminPermissions.includes('result:approve'))
  assert.ok(examOfficerPermissions.includes('result:view'))
  assert.ok(staffPermissions.includes('student:view'))
})
