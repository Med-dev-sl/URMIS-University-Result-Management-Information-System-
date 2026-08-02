import test from 'node:test'
import assert from 'node:assert/strict'
import { validateSettingsForm } from './settingsUtils.js'

test('returns validation errors for incomplete settings values', () => {
  const errors = validateSettingsForm({
    universityName: '',
    contactEmail: 'bad-email',
    smtpHost: '',
    smsApiKey: '',
    authRetention: '',
    gradingScale: '',
  })

  assert.equal(errors.universityName, 'University name is required.')
  assert.equal(errors.contactEmail, 'Enter a valid email address.')
  assert.equal(errors.smtpHost, 'SMTP host is required.')
  assert.equal(errors.smsApiKey, 'SMS API key is required.')
  assert.equal(errors.authRetention, 'Session retention is required.')
  assert.equal(errors.gradingScale, 'Grading scale is required.')
})
