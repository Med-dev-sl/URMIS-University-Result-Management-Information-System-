import { useMemo } from 'react'
import { useAuth } from '../auth/useAuth.js'

export default function ProfilePage() {
  const { user } = useAuth()

  const details = useMemo(() => [
    { label: 'Full name', value: user?.full_name || '–' },
    { label: 'Email', value: user?.email || '–' },
    { label: 'Role', value: user?.role || '–' },
    { label: 'University', value: user?.institutionId ? `ID ${user.institutionId}` : 'Platform-level access' },
    { label: 'Status', value: user?.activationStatus === 'active' ? 'Active' : user?.activationStatus || 'Unknown' },
  ], [user])

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h3>My profile</h3>
          <p className="field-hint">Review your account details, role, and university affiliation.</p>
        </div>
      </div>

      <div className="profile-summary">
        {details.map((item) => (
          <div key={item.label} className="profile-grid">
            <div><strong>{item.label}</strong></div>
            <div>{item.value}</div>
          </div>
        ))}
      </div>

      <div className="panel-header" style={{ marginTop: '1.5rem' }}>
        <div>
          <h4>Support</h4>
          <p className="field-hint">Use these quick actions for profile management.</p>
        </div>
      </div>

      <div className="content-grid">
        <article className="panel">
          <h4>Change password</h4>
          <p className="field-hint">Use the settings page to update your password and security settings.</p>
        </article>
        <article className="panel">
          <h4>Notifications</h4>
          <p className="field-hint">View your alerts, announcements, and messages from the institution.</p>
        </article>
        <article className="panel">
          <h4>Help & support</h4>
          <p className="field-hint">Contact your institution or IT support if you need assistance.</p>
        </article>
      </div>
    </div>
  )
}
