import test from 'node:test'
import assert from 'node:assert/strict'
import { getRolePermissions } from '../src/permissions/roles.js'

test('admin and super admin roles receive platform management permissions and not academic permissions', () => {
  const adminPermissions = getRolePermissions('admin')
  assert.ok(adminPermissions.includes('system:view'))
  assert.ok(adminPermissions.includes('user:manage'))
  assert.ok(adminPermissions.includes('report:view'))
  assert.ok(adminPermissions.includes('settings:view'))
  assert.ok(!adminPermissions.includes('student:view'))
  assert.ok(!adminPermissions.includes('result:view'))
  assert.ok(!adminPermissions.includes('result:approve'))
  assert.ok(!adminPermissions.includes('course:create'))
  assert.ok(!adminPermissions.includes('student:create'))

  const superAdminPermissions = getRolePermissions('super_admin')
  assert.ok(superAdminPermissions.includes('system:view'))
  assert.ok(superAdminPermissions.includes('user:manage'))
  assert.ok(superAdminPermissions.includes('report:view'))
  assert.ok(superAdminPermissions.includes('settings:view'))
  assert.ok(!superAdminPermissions.includes('student:view'))
  assert.ok(!superAdminPermissions.includes('result:view'))
  assert.ok(!superAdminPermissions.includes('result:approve'))
  assert.ok(!superAdminPermissions.includes('course:create'))
  assert.ok(!superAdminPermissions.includes('student:create'))
})

test('student roles keep profile and result access', () => {
  const permissions = getRolePermissions('student')
  assert.ok(permissions.includes('profile:view'))
  assert.ok(permissions.includes('result:view'))
})

test('platform admin is normalized as super admin and uses the platform administrator label', () => {
  const normalized = getRolePermissions('platform_admin')
  const alias = getRolePermissions('platform admin')
  assert.deepEqual(normalized, alias)
  assert.ok(normalized.includes('system:view'))
})
