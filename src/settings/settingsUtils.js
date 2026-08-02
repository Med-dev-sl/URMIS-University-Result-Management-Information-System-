export function validateSettingsForm(values) {
  const errors = {}

  if (!values.universityName?.trim()) {
    errors.universityName = 'University name is required.'
  }

  if (!values.contactEmail?.trim()) {
    errors.contactEmail = 'Contact email is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.contactEmail)) {
    errors.contactEmail = 'Enter a valid email address.'
  }

  if (!values.smtpHost?.trim()) {
    errors.smtpHost = 'SMTP host is required.'
  }

  if (!values.smsApiKey?.trim()) {
    errors.smsApiKey = 'SMS API key is required.'
  }

  if (!values.authRetention?.trim()) {
    errors.authRetention = 'Session retention is required.'
  }

  if (!values.gradingScale?.trim()) {
    errors.gradingScale = 'Grading scale is required.'
  }

  return errors
}
