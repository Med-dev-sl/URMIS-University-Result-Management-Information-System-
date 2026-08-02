import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/useAuth.js'
import { hasPermission } from '../permissions/permissions.js'

const emptyForm = {
  name: '',
  address: '',
  contact_email: '',
}

function normalizeInstitution(item) {
  return {
    id: item.id,
    name: item.name || 'Unnamed institution',
    address: item.address || '—',
    contact_email: item.contact_email || '—',
    created_at: item.created_at || null,
  }
}

function normalizeUser(item) {
  return {
    id: item.id,
    full_name: item.full_name || 'Unnamed user',
    email: item.email || '—',
    role: item.role || 'student',
    institutionId: item.institutionId ?? null,
    created_at: item.created_at || null,
  }
}

export default function PlatformAdminModule() {
  const { user } = useAuth()
  const [institutions, setInstitutions] = useState([])
  const [users, setUsers] = useState([])
  const [overview, setOverview] = useState(null)
  const [monitoring, setMonitoring] = useState(null)
  const [settings, setSettings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editingInstitutionId, setEditingInstitutionId] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  const canManagePlatform = hasPermission(user, 'system:view') || user?.role === 'super_admin' || user?.role === 'admin'

  const loadData = async () => {
    if (!canManagePlatform) {
      setError('You do not have platform administration access.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError('')
      const [overviewResponse, monitoringResponse, institutionsResponse, usersResponse, settingsResponse] = await Promise.all([
        fetch('/api/platform/overview', { headers: { Authorization: `Bearer ${user.token}` } }),
        fetch('/api/platform/monitoring', { headers: { Authorization: `Bearer ${user.token}` } }),
        fetch('/api/institution', { headers: { Authorization: `Bearer ${user.token}` } }),
        fetch('/api/users', { headers: { Authorization: `Bearer ${user.token}` } }),
        fetch('/api/platform/settings', { headers: { Authorization: `Bearer ${user.token}` } }),
      ])

      if (!overviewResponse.ok || !monitoringResponse.ok || !institutionsResponse.ok || !usersResponse.ok || !settingsResponse.ok) {
        throw new Error('Unable to load platform data.')
      }

      const [overviewBody, monitoringBody, institutionsBody, usersBody, settingsBody] = await Promise.all([
        overviewResponse.json(),
        monitoringResponse.json(),
        institutionsResponse.json(),
        usersResponse.json(),
        settingsResponse.json(),
      ])

      setOverview(overviewBody)
      setMonitoring(monitoringBody)
      setInstitutions(Array.isArray(institutionsBody) ? institutionsBody.map(normalizeInstitution) : [])
      setUsers(Array.isArray(usersBody) ? usersBody.map(normalizeUser) : [])
      setSettings(Array.isArray(settingsBody) ? settingsBody : [])
    } catch (loadError) {
      setError(loadError.message || 'Unable to load platform data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.token) {
      loadData()
    }
  }, [user?.token])

  const stats = useMemo(() => [
    { label: 'Universities', value: overview?.totalUniversities ?? institutions.length, detail: 'Registered institutions' },
    { label: 'Users', value: overview?.totalUsers ?? users.length, detail: 'Issued accounts' },
    { label: 'Revenue', value: `$${Number(overview?.revenue || 0).toLocaleString()}`, detail: 'Platform revenue' },
    { label: 'System status', value: overview?.systemStatus || monitoring?.status || 'healthy', detail: 'Operational' },
  ], [overview, monitoring, institutions.length, users.length])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.name) {
      setError('Institution name is required.')
      return
    }

    try {
      setError('')
      const method = editingInstitutionId ? 'PUT' : 'POST'
      const endpoint = editingInstitutionId ? `/api/institution/${editingInstitutionId}` : '/api/institution'
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.message || 'Institution save failed.')
      }

      setForm(emptyForm)
      setEditingInstitutionId(null)
      await loadData()
    } catch (submitError) {
      setError(submitError.message || 'Institution save failed.')
    }
  }

  const handleEdit = (institution) => {
    setForm({
      name: institution.name,
      address: institution.address === '—' ? '' : institution.address,
      contact_email: institution.contact_email === '—' ? '' : institution.contact_email,
    })
    setEditingInstitutionId(institution.id)
    setActiveTab('institutions')
  }

  const handleDelete = async (institutionId) => {
    if (!window.confirm('Delete this institution?')) {
      return
    }

    try {
      setError('')
      const response = await fetch(`/api/institution/${institutionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` },
      })
      if (!response.ok) {
        throw new Error('Institution deletion failed.')
      }
      await loadData()
    } catch (deleteError) {
      setError(deleteError.message || 'Institution deletion failed.')
    }
  }

  if (!canManagePlatform) {
    return <article className="panel"><h3>Platform administration</h3><p>You do not have access to this module.</p></article>
  }

  return (
    <article className="panel">
      <div className="panel-header">
        <div>
          <h3>Platform administration</h3>
          <p className="field-hint">Manage institutional tenants, user accounts, monitoring, and platform settings from a unified console.</p>
        </div>
      </div>

      <div className="academic-tabs" role="tablist" aria-label="Platform sections">
        {['overview', 'institutions', 'users', 'settings'].map((tab) => (
          <button key={tab} type="button" className={`tab-item ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {error ? <div className="alert">{error}</div> : null}

      {loading ? <div className="loading-card">Loading platform administration data…</div> : null}

      {!loading && activeTab === 'overview' ? (
        <div className="content-grid">
          <div className="panel">
            <h4>Platform overview</h4>
            <div className="stats-grid">
              {stats.map((stat) => (
                <div key={stat.label} className="stat-card">
                  <div className="stat-label">{stat.label}</div>
                  <div className="stat-value">{stat.value}</div>
                  <div className="field-hint">{stat.detail}</div>
                </div>
              ))}
            </div>
            <div className="tab-panel">
              <h4>Live monitoring</h4>
              <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{JSON.stringify(monitoring, null, 2)}</pre>
            </div>
          </div>
          <div className="panel">
            <h4>Institution snapshot</h4>
            <ul className="student-list">
              {institutions.slice(0, 5).map((institution) => (
                <li key={institution.id} className="student-item">
                  <div>
                    <strong>{institution.name}</strong>
                    <span>{institution.contact_email}</span>
                  </div>
                  <span>{institution.address}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      {!loading && activeTab === 'institutions' ? (
        <div className="content-grid">
          <div className="panel">
            <h4>{editingInstitutionId ? 'Edit institution' : 'Create institution'}</h4>
            <form className="auth-form" onSubmit={handleSubmit}>
              <label className="field-group">
                <span className="field-label">Institution name</span>
                <input className="field-input" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              </label>
              <label className="field-group">
                <span className="field-label">Address</span>
                <input className="field-input" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
              </label>
              <label className="field-group">
                <span className="field-label">Contact email</span>
                <input className="field-input" value={form.contact_email} onChange={(event) => setForm({ ...form, contact_email: event.target.value })} />
              </label>
              <div className="topbar-actions">
                <button className="primary-button" type="submit">{editingInstitutionId ? 'Save changes' : 'Create institution'}</button>
                {editingInstitutionId ? <button className="secondary-button" type="button" onClick={() => { setEditingInstitutionId(null); setForm(emptyForm) }}>Cancel</button> : null}
              </div>
            </form>
          </div>
          <div className="panel">
            <h4>Institutions</h4>
            <ul className="student-list">
              {institutions.map((institution) => (
                <li key={institution.id} className="student-item">
                  <div>
                    <strong>{institution.name}</strong>
                    <span>{institution.contact_email}</span>
                  </div>
                  <div className="topbar-actions">
                    <button className="link-button" type="button" onClick={() => handleEdit(institution)}>Edit</button>
                    <button className="link-button" type="button" onClick={() => handleDelete(institution.id)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      {!loading && activeTab === 'users' ? (
        <div className="panel">
          <h4>Users</h4>
          <ul className="student-list">
            {users.map((userItem) => (
              <li key={userItem.id} className="student-item">
                <div>
                  <strong>{userItem.full_name}</strong>
                  <span>{userItem.email} · {userItem.role}</span>
                </div>
                <span>{userItem.institutionId ?? 'No institution'}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {!loading && activeTab === 'settings' ? (
        <div className="panel">
          <h4>Platform settings</h4>
          <ul className="student-list">
            {settings.map((setting) => (
              <li key={setting.key} className="student-item">
                <div>
                  <strong>{setting.key}</strong>
                  <span>{setting.category || 'general'}</span>
                </div>
                <span>{setting.value}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  )
}
