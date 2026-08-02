import test from 'node:test'
import assert from 'node:assert/strict'
import { getRolePermissions } from '../src/permissions/roles.js'

test('admin and super admin roles receive platform permissions', () => {
  assert.ok(getRolePermissions('admin').includes('system:view'))
  assert.ok(getRolePermissions('admin').includes('user:manage'))
  assert.ok(getRolePermissions('super_admin').includes('system:view'))
  assert.ok(getRolePermissions('super_admin').includes('user:manage'))
})

test('student roles keep profile and result access', () => {
  const permissions = getRolePermissions('student')
  assert.ok(permissions.includes('profile:view'))
  assert.ok(permissions.includes('result:view'))
})
