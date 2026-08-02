import test from 'node:test'
import assert from 'node:assert/strict'
import { canApproveRegistration, getRegistrationRoleHint, getRegistrationStatusLabel, getSelectedCourseCreditUnits } from './registrationUtils.js'

test('returns a readable label for registration states', () => {
  assert.equal(getRegistrationStatusLabel('submitted'), 'Submitted')
  assert.equal(getRegistrationStatusLabel('approved'), 'Approved')
  assert.equal(getRegistrationStatusLabel('rejected'), 'Rejected')
})

test('allows review roles to approve registrations', () => {
  assert.equal(canApproveRegistration('hod'), true)
  assert.equal(canApproveRegistration('student'), false)
  assert.equal(canApproveRegistration('admin'), true)
})

test('summarises selected course credits from course data', () => {
  const courses = [
    { id: 1, course_code: 'CSC101', course_name: 'Intro to Computing', credit_hours: 3 },
    { id: 2, course_code: 'MTH101', course_name: 'Calculus I', credit_hours: 2 },
  ]

  assert.equal(getSelectedCourseCreditUnits(courses, [1, 2]), 5)
  assert.equal(getSelectedCourseCreditUnits(courses, [99]), 0)
})

test('returns role-aware registration guidance', () => {
  assert.deepEqual(getRegistrationRoleHint('student'), {
    title: 'Submit your registration',
    description: 'Students submit course selections for the current registration window.',
    cta: 'Submit registration',
  })

  assert.deepEqual(getRegistrationRoleHint('hod'), {
    title: 'Review pending registrations',
    description: 'Academic reviewers approve or reject student submissions for the active period.',
    cta: 'Review registrations',
  })
})
