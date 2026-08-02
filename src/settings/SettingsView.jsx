import { useState } from 'react'
import { validateSettingsForm } from './settingsUtils'

const settingsSections = [
  { id: 'institution', name: 'Institution profile', detail: 'University metadata, contact details, and campus profile', status: 'Configured' },
  { id: 'branding', name: 'Branding and appearance', detail: 'Theme, logo references, and visual defaults', status: 'Active' },
  { id: 'communications', name: 'Communications and integrations', detail: 'Email, SMS, and webhook connectivity', status: 'In review' },
  { id: 'security', name: 'Security and access', detail: 'Authentication retention and access safeguards', status: 'Protected' },
  { id: 'grading', name: 'Grading and assessments', detail: 'Policy bands and grading scale controls', status: 'Active' },
  { id: 'operations', name: 'Backup and audit', detail: 'Retention policies and operational oversight', status: 'Ready' },
]

const initialValues = {
  universityName: 'University of Riverdale',
  shortName: 'UoR',
  contactEmail: 'registry@riverdale.edu',
  supportPhone: '+234 803 000 0000',
  campusAddress: '123 Academic Avenue, Riverdale',
  themeMode: 'dark',
  primaryColor: '#2563eb',
  secondaryColor: '#0f172a',
  logoLabel: 'UoR Crest',
  smtpHost: 'smtp.riverdale.edu',
  smtpPort: '587',
  smsApiKey: 'sms-prod-key-001',
  webhookUrl: 'https://hooks.example.edu/urmis',
  authRetention: '24h',
  sessionTimeout: '60',
  require2FA: true,
  gradingScale: 'A-F',
  submissionWindow: '72h',
  appealWindow: '14d',
  backupFrequency: 'Daily',
  auditRetention: '365d',
}

const sectionFields = {
  institution: [
    { name: 'universityName', label: 'University name', type: 'text', placeholder: 'Enter university name' },
    { name: 'shortName', label: 'Short name', type: 'text', placeholder: 'Short institution name' },
    { name: 'contactEmail', label: 'Contact email', type: 'email', placeholder: 'registry@institution.edu' },
    { name: 'supportPhone', label: 'Support phone', type: 'text', placeholder: '+234 800 000 0000' },
    { name: 'campusAddress', label: 'Campus address', type: 'textarea', placeholder: 'Primary campus address' },
  ],
  branding: [
    { name: 'themeMode', label: 'Theme mode', type: 'select', options: ['light', 'dark', 'system'] },
    { name: 'primaryColor', label: 'Primary color', type: 'text', placeholder: '#2563eb' },
    { name: 'secondaryColor', label: 'Secondary color', type: 'text', placeholder: '#0f172a' },
    { name: 'logoLabel', label: 'Logo label', type: 'text', placeholder: 'Institution crest' },
  ],
  communications: [
    { name: 'smtpHost', label: 'SMTP host', type: 'text', placeholder: 'smtp.institution.edu' },
    { name: 'smtpPort', label: 'SMTP port', type: 'text', placeholder: '587' },
    { name: 'smsApiKey', label: 'SMS API key', type: 'text', placeholder: 'Secure key' },
    { name: 'webhookUrl', label: 'Webhook URL', type: 'text', placeholder: 'https://hooks.example.edu' },
  ],
  security: [
    { name: 'authRetention', label: 'Session retention', type: 'text', placeholder: '24h' },
    { name: 'sessionTimeout', label: 'Session timeout (minutes)', type: 'text', placeholder: '60' },
    { name: 'require2FA', label: 'Require 2FA for administrators', type: 'checkbox' },
  ],
  grading: [
    { name: 'gradingScale', label: 'Grading scale', type: 'text', placeholder: 'A-F' },
    { name: 'submissionWindow', label: 'Submission window', type: 'text', placeholder: '72h' },
    { name: 'appealWindow', label: 'Appeal window', type: 'text', placeholder: '14d' },
  ],
  operations: [
    { name: 'backupFrequency', label: 'Backup frequency', type: 'text', placeholder: 'Daily' },
    { name: 'auditRetention', label: 'Audit retention', type: 'text', placeholder: '365d' },
  ],
}

export default function SettingsView() {
  const [activeSection, setActiveSection] = useState(settingsSections[0].id)
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [statusMessage, setStatusMessage] = useState('')

  const selected = settingsSections.find((section) => section.id === activeSection) || settingsSections[0]
  const fields = sectionFields[activeSection] || sectionFields.institution

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setValues((previous) => ({ ...previous, [name]: type === 'checkbox' ? checked : value }))
    setErrors((previous) => ({ ...previous, [name]: '' }))
    setStatusMessage('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const validationErrors = validateSettingsForm(values)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setStatusMessage('')
      return
    }

    setErrors({})
    setStatusMessage('Platform configuration saved successfully.')
  }

  const handleReset = () => {
    setValues(initialValues)
    setErrors({})
    setStatusMessage('Configuration reset to the latest defaults.')
  }

  return (
    <section className="student-module-panel">
      <div className="student-hero">
        <div>
          <p className="eyebrow">Settings module</p>
          <h2>Institution configuration workspace</h2>
          <p className="panel-subtitle">Maintain university profile data, branding, communication channels, security posture, grading rules, and operational controls.</p>
        </div>
        <div className="student-hero-badge">
          <strong>{settingsSections.length}</strong>
          <span>Configuration areas</span>
        </div>
      </div>

      <div className="content-grid">
        <div className="panel">
          <div className="panel-header">
            <h3>Configuration areas</h3>
            <span className="pill">Manage</span>
          </div>
          <div className="stacked-list">
            {settingsSections.map((section) => (
              <button key={section.id} type="button" className={`student-card ${activeSection === section.id ? 'selected' : ''}`} onClick={() => { setActiveSection(section.id); setStatusMessage('') }}>
                <div className="student-card-main">
                  <div className="user-avatar">{section.name.slice(0, 2)}</div>
                  <div>
                    <strong>{section.name}</strong>
                    <p className="panel-subtitle">{section.detail}</p>
                  </div>
                </div>
                <span className="pill">{section.status}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>{selected.name}</h3>
            <span className="pill">Details</span>
          </div>
          <form className="student-tools" onSubmit={handleSubmit}>
            <div className="settings-summary">
              <div className="panel">
                <h4>Current status</h4>
                <p className="panel-subtitle">{selected.detail}</p>
                <div className="pill-list">
                  <span className="pill">{selected.status}</span>
                  <span className="pill muted">System ready</span>
                </div>
              </div>

              <div className="student-tools-row">
                <button className="primary-button" type="submit">Save changes</button>
                <button className="secondary-button" type="button" onClick={handleReset}>Reset</button>
              </div>

              {statusMessage ? <div className={`settings-status ${errors && Object.keys(errors).length > 0 ? 'error' : 'success'}`}>{statusMessage}</div> : null}
            </div>

            <div className="form-grid">
              {fields.map((field) => (
                <div className="field-group" key={field.name}>
                  <label htmlFor={field.name}>{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea
                      id={field.name}
                      name={field.name}
                      className="field-input"
                      placeholder={field.placeholder}
                      value={values[field.name] || ''}
                      onChange={handleChange}
                    />
                  ) : field.type === 'select' ? (
                    <select id={field.name} name={field.name} className="field-input" value={values[field.name] || ''} onChange={handleChange}>
                      {field.options.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : field.type === 'checkbox' ? (
                    <label className="checkbox-row">
                      <input id={field.name} name={field.name} type="checkbox" checked={Boolean(values[field.name])} onChange={handleChange} />
                      <span>{field.label}</span>
                    </label>
                  ) : (
                    <input
                      id={field.name}
                      name={field.name}
                      className="field-input"
                      type={field.type}
                      placeholder={field.placeholder}
                      value={values[field.name] || ''}
                      onChange={handleChange}
                    />
                  )}
                  {errors[field.name] ? <small className="error-text">{errors[field.name]}</small> : null}
                </div>
              ))}
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
