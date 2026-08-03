import { useEffect, useMemo, useState } from 'react'

export default function DashboardView({ dashboard, user, onViewChange, onShowError }) {
  const [institutionOptions, setInstitutionOptions] = useState([])
  const [provisioning, setProvisioning] = useState(false)
  const [provisionForm, setProvisionForm] = useState({
    fullName: '',
    email: '',
    institutionId: '',
    role: 'student',
    accountType: 'student',
    identityValue: '',
    universityId: '',
  })
  const [provisionMessage, setProvisionMessage] = useState('')
  const [provisionError, setProvisionError] = useState('')

  const isAdminProvisioningEnabled = useMemo(() => Boolean(user && ['admin', 'super_admin'].includes(String(user.role || '').toLowerCase())), [user])

  useEffect(() => {
    if (!isAdminProvisioningEnabled || !user?.token) {
      return
    }

    const loadInstitutions = async () => {
      try {
        const response = await fetch('/api/institution', {
          headers: { Authorization: `Bearer ${user.token}` },
        })
        if (!response.ok) {
          throw new Error('Unable to load institutions.')
        }

        const data = await response.json()
        const institutions = Array.isArray(data) ? data : []
        setInstitutionOptions(institutions)
        if (institutions.length && !provisionForm.institutionId) {
          setProvisionForm((current) => ({
            ...current,
            institutionId: String(institutions[0].id),
            universityId: institutions[0].name || '',
          }))
        }
      } catch (err) {
        onShowError?.(err.message)
      }
    }

    loadInstitutions()
  }, [isAdminProvisioningEnabled, user?.token, onShowError])

  const handleProvisionAccount = async (event) => {
    event.preventDefault()
    if (!user?.token) {
      setProvisionError('You must be signed in as an institution admin to create accounts.')
      return
    }

    if (!provisionForm.fullName || !provisionForm.email || !provisionForm.institutionId || !provisionForm.identityValue || !provisionForm.universityId) {
      setProvisionError('Please complete the full name, email, institution, identity, and university identifier fields.')
      return
    }

    setProvisioning(true)
    setProvisionError('')
    setProvisionMessage('')

    try {
      const response = await fetch('/api/auth/activate/provision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          full_name: provisionForm.fullName,
          email: provisionForm.email,
          institutionId: Number(provisionForm.institutionId),
          role: provisionForm.role,
          accountType: provisionForm.accountType,
          identityValue: provisionForm.identityValue,
          universityId: provisionForm.universityId,
        }),
      })

      const body = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(body.message || 'Unable to provision the account.')
      }

      setProvisionMessage(body.activationToken ? `Account provisioned. Share this activation token: ${body.activationToken}` : 'Account provisioned successfully. The new user can activate it from the sign-in flow.')
      setProvisionForm((current) => ({
        ...current,
        fullName: '',
        email: '',
        identityValue: '',
        universityId: institutionOptions[0]?.name || '',
      }))
    } catch (err) {
      setProvisionError(err.message)
    } finally {
      setProvisioning(false)
    }
  }

  return (
    <>
      {isAdminProvisioningEnabled ? (
        <section className="panel" style={{ marginBottom: '1rem' }}>
          <div className="panel-header">
            <div>
              <h3>Provision activation account</h3>
              <p className="field-hint">Create a pre-provisioned institutional account for a student or staff member.</p>
            </div>
          </div>

          {provisionMessage ? <div className="auth-message success">{provisionMessage}</div> : null}
          {provisionError ? <div className="auth-message error">{provisionError}</div> : null}

          <form className="auth-form" onSubmit={handleProvisionAccount}>
            <div className="field-group">
              <label className="field-label" htmlFor="provision-full-name">Full name</label>
              <input id="provision-full-name" className="field-input" name="fullName" value={provisionForm.fullName} onChange={(event) => setProvisionForm((current) => ({ ...current, fullName: event.target.value }))} placeholder="Jane Doe" required />
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="provision-email">Email</label>
              <input id="provision-email" className="field-input" name="email" type="email" value={provisionForm.email} onChange={(event) => setProvisionForm((current) => ({ ...current, email: event.target.value }))} placeholder="jane@youruniversity.edu" required />
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="provision-institution">Institution</label>
              <select id="provision-institution" className="field-input" value={provisionForm.institutionId} onChange={(event) => setProvisionForm((current) => ({ ...current, institutionId: event.target.value, universityId: event.target.selectedOptions[0]?.text || current.universityId }))} required>
                <option value="">Select institution</option>
                {institutionOptions.map((institution) => (
                  <option key={institution.id} value={institution.id}>{institution.name}</option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="provision-role">Role</label>
              <select id="provision-role" className="field-input" value={provisionForm.role} onChange={(event) => setProvisionForm((current) => ({ ...current, role: event.target.value }))}>
                <option value="student">Student</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="provision-account-type">Account type</label>
              <select id="provision-account-type" className="field-input" value={provisionForm.accountType} onChange={(event) => setProvisionForm((current) => ({ ...current, accountType: event.target.value }))}>
                <option value="student">Student</option>
                <option value="staff">Staff</option>
              </select>
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="provision-identity">Identity value</label>
              <input id="provision-identity" className="field-input" name="identityValue" value={provisionForm.identityValue} onChange={(event) => setProvisionForm((current) => ({ ...current, identityValue: event.target.value }))} placeholder="STU-1003" required />
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="provision-university-id">University identifier</label>
              <input id="provision-university-id" className="field-input" name="universityId" value={provisionForm.universityId} onChange={(event) => setProvisionForm((current) => ({ ...current, universityId: event.target.value }))} placeholder="greenfield" required />
            </div>

            <button className="primary-button auth-button" type="submit" disabled={provisioning}>
              {provisioning ? 'Provisioning...' : 'Provision account'}
            </button>
          </form>
        </section>
      ) : null}

      <section className="stats-grid" aria-label="Key metrics">
        {dashboard.stats.map((stat) => (
          <article key={stat.label} className="stat-card">
            <div className="stat-meta">
              <span className="stat-label">{stat.label}</span>
              <span className="stat-trend">{stat.trend}</span>
            </div>
            <strong className="stat-value">{stat.value}</strong>
          </article>
        ))}
      </section>

      <section className="content-grid">
        <article className="panel">
          <div className="panel-header">
            <h3>Students</h3>
            <button type="button" className="link-button" onClick={() => onViewChange('Students')}>
              View all
            </button>
          </div>

          <ul className="student-list">
            {dashboard.students.map((student) => (
              <li key={student.id} className="student-item">
                <div>
                  <strong>{student.full_name}</strong>
                  <span>
                    {student.student_id} · {student.department_name}
                  </span>
                </div>
                <span className="student-badge">{student.semester}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="panel">
          <div className="panel-header">
            <h3>Recent results</h3>
            <button type="button" className="link-button" onClick={() => onViewChange('Results')}>
              View all
            </button>
          </div>

          <ul className="results-list">
            {dashboard.recentResults.map((result) => (
              <li key={result.id} className="result-item">
                <div>
                  <strong>{result.student_name}</strong>
                  <span>{result.course_name}</span>
                </div>
                <div className="result-score">
                  <span>{result.grade}</span>
                  <small>{result.percentage}%</small>
                </div>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </>
  )
}
