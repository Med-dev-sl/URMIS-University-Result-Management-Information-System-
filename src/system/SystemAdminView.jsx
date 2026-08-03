import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'
import { permissions } from '../permissions/permissions.js'
import { hasPermission } from '../permissions/permissions.js'
import LoadingState from '../shared/components/LoadingState.jsx'

const DEFAULT_SETTINGS = {
  platformName: 'URMIS',
  timezone: 'UTC',
  language: 'English',
  passwordPolicy: 'Strong',
  sessionTimeout: '30 minutes',
  loginAttempts: 5,
  jwtExpiration: '15 minutes',
  refreshTokenDuration: '7 days',
  emailNotifications: false,
  smsNotifications: false,
  gradingScale: 'A-F',
  gpaFormula: '4.0',
  creditSystem: 'Credit Based',
}

function normalizeInstitution(item) {
  return {
    id: item.id,
    name: item.name || item.university_name || 'Unnamed university',
    code: item.code || item.university_code || 'N/A',
    email: item.email || item.contact_email || '—',
    phone: item.phone || item.contact_phone || '—',
    country: item.country || item.location || 'Unknown',
    status: item.status || 'active',
    subscriptionPlan: item.subscriptionPlan || item.plan || 'Standard',
    expiryDate: item.expiryDate || item.subscriptionExpiry || '',
    logo: item.logo || item.brand_logo || '',
    trial: String(item.subscriptionPlan || item.plan || '').toLowerCase().includes('trial'),
  }
}

function normalizeAdministrator(item) {
  return {
    id: item.id,
    fullName: item.full_name || item.name || 'Unnamed administrator',
    email: item.email || '—',
    university: item.university?.name || item.institution?.name || item.universityName || 'Unknown',
    phone: item.phone || item.contact_phone || '—',
    status: item.status || 'active',
    lastLogin: item.last_login || item.lastLogin || '',
  }
}

function normalizeAuditEvent(event) {
  return {
    id: event.id || `${event.action}-${event.timestamp || event.created_at}`,
    userName: event.user_name || event.user || 'Unknown user',
    action: event.action || event.event || 'Unknown action',
    details: event.details || event.route || 'N/A',
    createdAt: event.created_at || event.timestamp || '',
    ipAddress: event.ip_address || event.ip || 'Unknown',
    browser: event.browser || 'Unknown browser',
    device: event.device || 'Unknown device',
  }
}

function formatDate(value) {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString()
}

function MetricCard({ label, value, detail }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="field-hint">{detail}</div>
    </div>
  )
}

function TableRow({ children }) {
  return <tr>{children}</tr>
}

export default function SystemAdminView() {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const [overview, setOverview] = useState(null)
  const [monitoring, setMonitoring] = useState(null)
  const [institutions, setInstitutions] = useState([])
  const [administrators, setAdministrators] = useState([])
  const [auditEvents, setAuditEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerms, setSearchTerms] = useState({ universities: '', admins: '', audit: '' })
  const [universityFilter, setUniversityFilter] = useState('all')
  const [settingsState, setSettingsState] = useState(DEFAULT_SETTINGS)

  const normalizedPath = location.pathname.replace(/\/+$|\/\//g, '/')
  const activeSection = normalizedPath === '/dashboard/system' ? 'info' : normalizedPath.replace('/dashboard/system/', '')

  const canManageSystem = useMemo(() => hasPermission(user, permissions.SYSTEM_MANAGE), [user])

  const normalizedInstitutions = useMemo(() => institutions.map(normalizeInstitution), [institutions])
  const normalizedAdmins = useMemo(() => administrators.map(normalizeAdministrator), [administrators])
  const normalizedAuditEvents = useMemo(() => auditEvents.map(normalizeAuditEvent), [auditEvents])

  const loginActivities = useMemo(
    () => normalizedAuditEvents.filter((event) => /login|sign\s?in|authentication/i.test(`${event.action} ${event.details}`)),
    [normalizedAuditEvents],
  )
  const securityAlerts = useMemo(
    () => normalizedAuditEvents.filter((event) => /alert|security|unauthori[sz]ed|failed|error/i.test(`${event.action} ${event.details}`)),
    [normalizedAuditEvents],
  )

  const [rolesConfig, setRolesConfig] = useState([
    { role: 'Administrator', permissions: ['Full platform access', 'Manage users', 'Manage subscriptions', 'View reports'] },
    { role: 'University Admin', permissions: ['Manage university accounts', 'View reports', 'Configure defaults'] },
    { role: 'Staff', permissions: ['Manage academic records', 'View student activity'] },
    { role: 'Student', permissions: ['View results', 'Access student portal'] },
  ])

  const [subscriptionPlan, setSubscriptionPlan] = useState('Standard')
  const [paymentPolicy, setPaymentPolicy] = useState('Invoice')
  const [securityAlertMode, setSecurityAlertMode] = useState('All')

  const summaryMetrics = useMemo(() => {
    const activeCount = normalizedInstitutions.filter((item) => item.status === 'active').length
    const suspendedCount = normalizedInstitutions.filter((item) => item.status === 'suspended').length
    const trialCount = normalizedInstitutions.filter((item) => item.trial).length
    const expiredCount = normalizedInstitutions.filter((item) => item.expiryDate && new Date(item.expiryDate) < new Date()).length
    const activeUsers = normalizedAdmins.filter((item) => item.status === 'active').length

    return {
      activeUniversities: activeCount,
      suspendedUniversities: suspendedCount,
      trialUniversities: trialCount,
      expiredSubscriptions: expiredCount,
      totalUniversityAdmins: normalizedAdmins.length,
      totalStaff: normalizedAdmins.filter((item) => item.role === 'staff').length,
      totalStudents: normalizedAdmins.filter((item) => item.role === 'student').length,
      totalActiveUsers: activeUsers,
      activeSubscriptions: normalizedInstitutions.filter((item) => item.status === 'active' && !item.trial).length,
      renewalReminders: normalizedInstitutions.filter((item) => {
        const expiry = new Date(item.expiryDate)
        const now = new Date()
        const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))
        return diffDays > 0 && diffDays <= 30
      }).length,
    }
  }, [normalizedInstitutions, normalizedAdmins])

  const filteredInstitutions = useMemo(() => {
    const query = searchTerms.universities.toLowerCase().trim()
    return normalizedInstitutions.filter((institution) => {
      if (universityFilter !== 'all' && institution.status !== universityFilter) return false
      if (!query) return true
      return [institution.name, institution.code, institution.email].some((field) => field.toLowerCase().includes(query))
    })
  }, [normalizedInstitutions, searchTerms.universities, universityFilter])

  const filteredAdmins = useMemo(() => {
    const query = searchTerms.admins.toLowerCase().trim()
    return normalizedAdmins.filter((admin) => {
      if (!query) return true
      return [admin.fullName, admin.email, admin.university].some((field) => field.toLowerCase().includes(query))
    })
  }, [normalizedAdmins, searchTerms.admins])

  const filteredAuditEvents = useMemo(() => {
    const query = searchTerms.audit.toLowerCase().trim()
    return normalizedAuditEvents.filter((event) => {
      if (!query) return true
      return [event.userName, event.action, event.details, event.ipAddress, event.browser, event.device]
        .some((field) => field.toLowerCase().includes(query))
    })
  }, [normalizedAuditEvents, searchTerms.audit])

  useEffect(() => {
    if (!user?.token) return

    let active = true
    const loadData = async () => {
      setLoading(true)
      setError('')

      try {
        const [overviewRes, monitoringRes, institutionsRes, adminsRes, auditRes] = await Promise.all([
          fetch('/api/platform/overview', { headers: { Authorization: `Bearer ${user.token}` } }),
          fetch('/api/platform/monitoring', { headers: { Authorization: `Bearer ${user.token}` } }),
          fetch('/api/institution', { headers: { Authorization: `Bearer ${user.token}` } }),
          fetch('/api/users', { headers: { Authorization: `Bearer ${user.token}` } }),
          fetch('/api/platform/audit-logs?limit=50', { headers: { Authorization: `Bearer ${user.token}` } }),
        ])

        if (!overviewRes.ok || !monitoringRes.ok || !institutionsRes.ok || !adminsRes.ok || !auditRes.ok) {
          throw new Error('Unable to load system administration data.')
        }

        const [overviewBody, monitoringBody, institutionsBody, adminsBody, auditBody] = await Promise.all([
          overviewRes.json(),
          monitoringRes.json(),
          institutionsRes.json(),
          adminsRes.json(),
          auditRes.json(),
        ])

        if (!active) return
        setOverview(overviewBody)
        setMonitoring(monitoringBody)
        setInstitutions(Array.isArray(institutionsBody) ? institutionsBody : [])
        setAdministrators(Array.isArray(adminsBody) ? adminsBody : [])
        setAuditEvents(Array.isArray(auditBody) ? auditBody : [])
      } catch (loadError) {
        if (active) setError(loadError.message || 'Unable to load system administration data.')
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadData()
    return () => {
      active = false
    }
  }, [user?.token])

  const handleNavigate = (route) => navigate(route)
  const handleSearch = (key, value) => setSearchTerms((current) => ({ ...current, [key]: value }))

  const renderSection = () => {
    switch (activeSection) {
      case 'universities':
        return (
          <section className="panel">
            <div className="panel-header">
              <div>
                <h4>Universities</h4>
                <p className="field-hint">Manage every university tenant on the URMIS platform.</p>
              </div>
            </div>

            <div className="filter-row">
              <div className="field-group">
                <label className="field-label">Search</label>
                <input
                  className="field-input"
                  type="search"
                  value={searchTerms.universities}
                  onChange={(event) => handleSearch('universities', event.target.value)}
                  placeholder="Search by name, code, or email"
                />
              </div>
              <div className="field-group">
                <label className="field-label">Status</label>
                <select className="field-input" value={universityFilter} onChange={(event) => setUniversityFilter(event.target.value)}>
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="trial">Trial</option>
                  <option value="expired">Expired subscription</option>
                </select>
              </div>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Logo</th>
                    <th>Name</th>
                    <th>Code</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Country</th>
                    <th>Status</th>
                    <th>Plan</th>
                    <th>Expiry</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInstitutions.map((institution) => (
                    <TableRow key={institution.id}>
                      <td>{institution.logo ? <img className="small-avatar" src={institution.logo} alt={`${institution.name} logo`} /> : '—'}</td>
                      <td>{institution.name}</td>
                      <td>{institution.code}</td>
                      <td>{institution.email}</td>
                      <td>{institution.phone}</td>
                      <td>{institution.country}</td>
                      <td>{institution.status}</td>
                      <td>{institution.subscriptionPlan}</td>
                      <td>{formatDate(institution.expiryDate)}</td>
                      <td>
                        <button type="button" className="secondary-button" onClick={() => handleNavigate('/dashboard/system/university-administrators')}>Admins</button>
                      </td>
                    </TableRow>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )
      case 'university-administrators':
        return (
          <section className="panel">
            <div className="panel-header">
              <div>
                <h4>University Administrators</h4>
                <p className="field-hint">Manage university administrator accounts and privileges.</p>
              </div>
            </div>

            <div className="filter-row">
              <div className="field-group">
                <label className="field-label">Search</label>
                <input
                  className="field-input"
                  type="search"
                  value={searchTerms.admins}
                  onChange={(event) => handleSearch('admins', event.target.value)}
                  placeholder="Search by name, email, or university"
                />
              </div>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>University</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Last Login</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdmins.map((admin) => (
                    <TableRow key={admin.id}>
                      <td>{admin.fullName}</td>
                      <td>{admin.email}</td>
                      <td>{admin.university}</td>
                      <td>{admin.phone}</td>
                      <td>{admin.status}</td>
                      <td>{formatDate(admin.lastLogin)}</td>
                      <td>
                        <button type="button" className="secondary-button">Reset password</button>
                        <button type="button" className="secondary-button">Suspend</button>
                      </td>
                    </TableRow>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )
      case 'users':
        return (
          <section className="panel">
            <div className="panel-header">
              <div>
                <h4>Platform Users</h4>
                <p className="field-hint">Manage administrative users, their permissions, and platform access.</p>
              </div>
            </div>

            <div className="filter-row">
              <div className="field-group">
                <label className="field-label">Search</label>
                <input
                  className="field-input"
                  type="search"
                  value={searchTerms.admins}
                  onChange={(event) => handleSearch('admins', event.target.value)}
                  placeholder="Search by user, email, or university"
                />
              </div>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>University</th>
                    <th>Status</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdmins.map((admin) => (
                    <TableRow key={admin.id}>
                      <td>{admin.fullName}</td>
                      <td>{admin.email}</td>
                      <td>{admin.university}</td>
                      <td>{admin.status}</td>
                      <td>{admin.role || 'Admin'}</td>
                      <td>
                        <button type="button" className="secondary-button">Edit</button>
                        <button type="button" className="secondary-button">Deactivate</button>
                      </td>
                    </TableRow>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )
      case 'roles-permissions':
        return (
          <section className="panel">
            <div className="panel-header">
              <div>
                <h4>Roles & Permissions</h4>
                <p className="field-hint">Control role definitions and platform permission assignments.</p>
              </div>
              <button type="button" className="primary-button" onClick={() => setRolesConfig((current) => current)}>Refresh</button>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Role</th>
                    <th>Permissions</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rolesConfig.map((entry) => (
                    <TableRow key={entry.role}>
                      <td>{entry.role}</td>
                      <td>{entry.permissions.join(', ')}</td>
                      <td>
                        <button type="button" className="secondary-button">Edit</button>
                        <button type="button" className="secondary-button">Clone</button>
                      </td>
                    </TableRow>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )
      case 'subscriptions/plans':
        return (
          <section className="panel">
            <div className="panel-header">
              <div>
                <h4>Subscription Plans</h4>
                <p className="field-hint">Manage the catalog of available subscription plans and pricing.</p>
              </div>
            </div>

            <div className="content-grid">
              <div className="panel">
                <div className="field-group">
                  <label className="field-label">Default subscription plan</label>
                  <select className="field-input" value={subscriptionPlan} onChange={(event) => setSubscriptionPlan(event.target.value)}>
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>
                <button type="button" className="primary-button">Save plan</button>
              </div>
              <div className="panel">
                <h5>Plan details</h5>
                <p>Current default plan: <strong>{subscriptionPlan}</strong></p>
                <p>Pricing and features are updated across tenant subscriptions automatically.</p>
              </div>
            </div>
          </section>
        )
      case 'subscriptions/universities':
        return (
          <section className="panel">
            <div className="panel-header">
              <div>
                <h4>University Subscriptions</h4>
                <p className="field-hint">Review subscription details for each university tenant.</p>
              </div>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>University</th>
                    <th>Plan</th>
                    <th>Status</th>
                    <th>Expiry</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {normalizedInstitutions.map((institution) => (
                    <TableRow key={institution.id}>
                      <td>{institution.name}</td>
                      <td>{institution.subscriptionPlan}</td>
                      <td>{institution.status}</td>
                      <td>{formatDate(institution.expiryDate)}</td>
                      <td><button type="button" className="secondary-button">Manage</button></td>
                    </TableRow>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )
      case 'subscriptions/billing':
        return (
          <section className="panel">
            <div className="panel-header">
              <div>
                <h4>Billing & Payments</h4>
                <p className="field-hint">Reconcile invoices, billing cycles, and payment status for university accounts.</p>
              </div>
            </div>

            <div className="content-grid">
              <div className="panel">
                <h5>Billing policy</h5>
                <div className="field-group">
                  <label className="field-label">Payment method</label>
                  <select className="field-input" value={paymentPolicy} onChange={(event) => setPaymentPolicy(event.target.value)}>
                    <option value="Invoice">Invoice</option>
                    <option value="Card">Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
                <button type="button" className="primary-button">Save billing policy</button>
              </div>
              <div className="panel">
                <h5>Outstanding invoices</h5>
                <p>Review invoice status and payment history for tracked universities.</p>
              </div>
            </div>
          </section>
        )
      case 'reports/platform':
        return (
          <section className="panel">
            <div className="panel-header">
              <div>
                <h4>Platform Reports</h4>
                <p className="field-hint">Generate cross-university reports and export them as needed.</p>
              </div>
            </div>

            <div className="stats-grid">
              <MetricCard label="Universities" value={normalizedInstitutions.length} detail="All tenants" />
              <MetricCard label="Active users" value={summaryMetrics.totalActiveUsers} detail="Signed in users" />
              <MetricCard label="Total staff" value={summaryMetrics.totalStaff} detail="University staff" />
              <MetricCard label="Total students" value={summaryMetrics.totalStudents} detail="Registered students" />
            </div>

            <div className="content-grid">
              <div className="panel">
                <h5>Usage report</h5>
                <p>Daily logins: {overview?.todayLogins ?? 0}</p>
                <p>API requests: {monitoring?.apiRequests ?? 0}</p>
                <p>Active sessions: {monitoring?.activeSessions ?? 0}</p>
              </div>
              <div className="panel">
                <h5>Subscription report</h5>
                <p>Expired subscriptions: {summaryMetrics.expiredSubscriptions}</p>
                <p>Renewal reminders: {summaryMetrics.renewalReminders}</p>
                <p>Trial universities: {summaryMetrics.trialUniversities}</p>
              </div>
            </div>
          </section>
        )
      case 'reports/usage':
        return (
          <section className="panel">
            <div className="panel-header">
              <div>
                <h4>Usage Analytics</h4>
                <p className="field-hint">Track platform usage and adoption across institutions.</p>
              </div>
            </div>

            <div className="stats-grid">
              <MetricCard label="Daily logins" value={overview?.todayLogins ?? 0} detail="Active sign-ins" />
              <MetricCard label="API requests" value={monitoring?.apiRequests ?? 0} detail="Platform traffic" />
              <MetricCard label="Active sessions" value={monitoring?.activeSessions ?? 0} detail="Concurrent users" />
              <MetricCard label="Total universities" value={normalizedInstitutions.length} detail="Tenant count" />
            </div>

            <div className="panel">
              <h5>Adoption notes</h5>
              <p>Use this view to identify growth, engagement, and potential support opportunities.</p>
            </div>
          </section>
        )
      case 'audit-logs':
        return (
          <section className="panel">
            <div className="panel-header">
              <div>
                <h4>Audit Logs</h4>
                <p className="field-hint">Search and filter system events, security actions, and platform changes.</p>
              </div>
            </div>

            <div className="filter-row">
              <div className="field-group">
                <label className="field-label">Search</label>
                <input
                  className="field-input"
                  type="search"
                  value={searchTerms.audit}
                  onChange={(event) => handleSearch('audit', event.target.value)}
                  placeholder="Search by user, action, IP, browser, or device"
                />
              </div>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Action</th>
                    <th>Date</th>
                    <th>IP Address</th>
                    <th>Browser</th>
                    <th>Device</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAuditEvents.map((event) => (
                    <TableRow key={event.id}>
                      <td>{event.userName}</td>
                      <td>{event.action}</td>
                      <td>{formatDate(event.createdAt)}</td>
                      <td>{event.ipAddress}</td>
                      <td>{event.browser}</td>
                      <td>{event.device}</td>
                    </TableRow>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )
      case 'audit-logs/login-activities':
        return (
          <section className="panel">
            <div className="panel-header">
              <div>
                <h4>Login Activities</h4>
                <p className="field-hint">Inspect recent login and authentication activity across the platform.</p>
              </div>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Action</th>
                    <th>Date</th>
                    <th>IP Address</th>
                    <th>Browser</th>
                    <th>Device</th>
                  </tr>
                </thead>
                <tbody>
                  {loginActivities.length ? loginActivities.map((event) => (
                    <TableRow key={event.id}>
                      <td>{event.userName}</td>
                      <td>{event.action}</td>
                      <td>{formatDate(event.createdAt)}</td>
                      <td>{event.ipAddress}</td>
                      <td>{event.browser}</td>
                      <td>{event.device}</td>
                    </TableRow>
                  )) : (
                    <tr><td colSpan="6">No login activity found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )
      case 'monitoring/security-alerts':
        return (
          <section className="panel">
            <div className="panel-header">
              <div>
                <h4>Security Alerts</h4>
                <p className="field-hint">Review security incidents, alerts, and suspicious events.</p>
              </div>
            </div>

            <div className="filter-row">
              <div className="field-group">
                <label className="field-label">Severity</label>
                <select className="field-input" value={securityAlertMode} onChange={(event) => setSecurityAlertMode(event.target.value)}>
                  <option value="All">All</option>
                  <option value="Critical">Critical</option>
                  <option value="Warning">Warning</option>
                  <option value="Info">Info</option>
                </select>
              </div>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Alert</th>
                    <th>User</th>
                    <th>Date</th>
                    <th>IP</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {securityAlerts.length ? securityAlerts.map((event) => (
                    <TableRow key={event.id}>
                      <td>{event.action}</td>
                      <td>{event.userName}</td>
                      <td>{formatDate(event.createdAt)}</td>
                      <td>{event.ipAddress}</td>
                      <td>{event.details}</td>
                    </TableRow>
                  )) : (
                    <tr><td colSpan="5">No security alerts available.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )
      case 'monitoring':
        return (
          <section className="panel">
            <div className="panel-header">
              <div>
                <h4>System Monitoring</h4>
                <p className="field-hint">Monitor platform health and operational telemetry.</p>
              </div>
            </div>

            <div className="stats-grid">
              <MetricCard label="API status" value={monitoring?.apiStatus || 'Unknown'} detail={`Requests: ${monitoring?.apiRequests ?? 'N/A'}`} />
              <MetricCard label="Database status" value={monitoring?.databaseStatus || 'Unknown'} detail={`Query time: ${monitoring?.queryTime ?? 'N/A'}ms`} />
              <MetricCard label="Active sessions" value={monitoring?.activeSessions ?? 0} detail="Concurrent users" />
              <MetricCard label="Failed requests" value={monitoring?.failedRequests ?? 0} detail="Error count" />
            </div>

            <div className="content-grid">
              <div className="panel">
                <h5>Current health</h5>
                <p>Uptime: {monitoring?.uptime ?? 'N/A'}</p>
                <p>Storage used: {monitoring?.storageUsed ?? 'N/A'}</p>
              </div>
              <div className="panel">
                <h5>Alerts</h5>
                <p>Security alerts: {securityAlerts.length}</p>
                <p>Login activity: {loginActivities.length}</p>
              </div>
            </div>
          </section>
        )
      case 'settings/global':
        return (
          <section className="panel">
            <div className="panel-header">
              <div>
                <h4>Global Settings</h4>
                <p className="field-hint">Configure platform-wide defaults, appearance, and general behaviour.</p>
              </div>
            </div>

            <div className="content-grid">
              <div className="panel">
                <h5>General configuration</h5>
                <div className="field-group">
                  <label className="field-label">Platform Name</label>
                  <input className="field-input" value={settingsState.platformName} onChange={(event) => setSettingsState((current) => ({ ...current, platformName: event.target.value }))} />
                </div>
                <div className="field-group">
                  <label className="field-label">Timezone</label>
                  <input className="field-input" value={settingsState.timezone} onChange={(event) => setSettingsState((current) => ({ ...current, timezone: event.target.value }))} />
                </div>
                <button type="button" className="primary-button">Save global settings</button>
              </div>
              <div className="panel">
                <h5>Defaults</h5>
                <p>General settings are used for every tenant and administrative action.</p>
              </div>
            </div>
          </section>
        )
      case 'settings/authentication':
        return (
          <section className="panel">
            <div className="panel-header">
              <div>
                <h4>Authentication Settings</h4>
                <p className="field-hint">Configure sign-in policies, token expiry, and identity controls.</p>
              </div>
            </div>

            <div className="content-grid">
              <div className="panel">
                <div className="field-group">
                  <label className="field-label">JWT Expiration</label>
                  <input className="field-input" value={settingsState.jwtExpiration} onChange={(event) => setSettingsState((current) => ({ ...current, jwtExpiration: event.target.value }))} />
                </div>
                <div className="field-group">
                  <label className="field-label">Refresh Token Duration</label>
                  <input className="field-input" value={settingsState.refreshTokenDuration} onChange={(event) => setSettingsState((current) => ({ ...current, refreshTokenDuration: event.target.value }))} />
                </div>
                <button type="button" className="primary-button">Save authentication settings</button>
              </div>
              <div className="panel">
                <h5>Authentication notes</h5>
                <p>These settings control access and session policies for all system users.</p>
              </div>
            </div>
          </section>
        )
      case 'settings/notification':
        return (
          <section className="panel">
            <div className="panel-header">
              <div>
                <h4>Notification Settings</h4>
                <p className="field-hint">Configure platform notifications, alerts, and communication defaults.</p>
              </div>
            </div>

            <div className="panel">
              <div className="field-group">
                <label className="field-label">Email notifications</label>
                <input type="checkbox" checked={settingsState.emailNotifications} onChange={(event) => setSettingsState((current) => ({ ...current, emailNotifications: event.target.checked }))} />
              </div>
              <div className="field-group">
                <label className="field-label">SMS notifications</label>
                <input type="checkbox" checked={settingsState.smsNotifications} onChange={(event) => setSettingsState((current) => ({ ...current, smsNotifications: event.target.checked }))} />
              </div>
              <button type="button" className="primary-button">Save notification settings</button>
            </div>
          </section>
        )
      case 'help':
        return (
          <section className="panel">
            <div className="panel-header">
              <div>
                <h4>Help & Documentation</h4>
                <p className="field-hint">Access platform resources, release notes, and support information.</p>
              </div>
            </div>

            <div className="content-grid">
              <div className="panel">
                <a className="link-button" href="/docs/backend/README.md">API documentation</a>
                <a className="link-button" href="/README.md">User guide</a>
                <a className="link-button" href="/docs/backend/openapi.yaml">OpenAPI spec</a>
              </div>
              <div className="panel">
                <h5>Support</h5>
                <p>Release notes, version history, and product guidance are available in docs.</p>
                <p><strong>Contact:</strong> support@urmis.example.com</p>
              </div>
            </div>
          </section>
        )
      case 'info':
        return (
          <section className="panel">
            <div className="panel-header">
              <div>
                <h4>Platform Administration Overview</h4>
                <p className="field-hint">View system-level metrics, tenant health, and platform operational status.</p>
              </div>
            </div>

            <div className="stats-grid">
              <MetricCard label="Tenant universities" value={normalizedInstitutions.length} detail="Registered tenants" />
              <MetricCard label="Active subscriptions" value={summaryMetrics.activeSubscriptions} detail="Live tenant plans" />
              <MetricCard label="University administrators" value={summaryMetrics.totalUniversityAdmins} detail="Admin accounts" />
              <MetricCard label="Pending alerts" value={securityAlerts.length} detail="Security incidents" />
            </div>

            <div className="content-grid">
              <div className="panel">
                <h5>Operational health</h5>
                <p>API status: {monitoring?.apiStatus || 'Unknown'}</p>
                <p>Database status: {monitoring?.databaseStatus || 'Unknown'}</p>
                <p>Server status: {monitoring?.serverStatus || 'Unknown'}</p>
              </div>
              <div className="panel">
                <h5>Platform activity</h5>
                <p>Today&apos;s login count: {overview?.todayLogins ?? 0}</p>
                <p>Active sessions: {monitoring?.activeSessions ?? 0}</p>
                <p>Recent security alerts: {securityAlerts.length}</p>
              </div>
            </div>
          </section>
        )
      default:
        return (
          <section className="panel">
            <div className="panel-header">
              <div>
                <h4>Platform Administration Overview</h4>
                <p className="field-hint">View system-level metrics, tenant health, and platform operational status.</p>
              </div>
            </div>

            <div className="stats-grid">
              <MetricCard label="Tenant universities" value={normalizedInstitutions.length} detail="Registered tenants" />
              <MetricCard label="Active subscriptions" value={summaryMetrics.activeSubscriptions} detail="Live tenant plans" />
              <MetricCard label="University administrators" value={summaryMetrics.totalUniversityAdmins} detail="Admin accounts" />
              <MetricCard label="Pending alerts" value={securityAlerts.length} detail="Security incidents" />
            </div>

            <div className="content-grid">
              <div className="panel">
                <h5>Operational health</h5>
                <p>API status: {monitoring?.apiStatus || 'Unknown'}</p>
                <p>Database status: {monitoring?.databaseStatus || 'Unknown'}</p>
                <p>Server status: {monitoring?.serverStatus || 'Unknown'}</p>
              </div>
              <div className="panel">
                <h5>Platform activity</h5>
                <p>Today&apos;s login count: {overview?.todayLogins ?? 0}</p>
                <p>Active sessions: {monitoring?.activeSessions ?? 0}</p>
                <p>Recent security alerts: {securityAlerts.length}</p>
              </div>
            </div>
          </section>
        )
    }
  }

  return (
    <article className="panel system-admin-page">
      <div className="panel-header">
        <div>
          <h3>System Administrator console</h3>
          <p className="field-hint">Manage the full URMIS platform, tenant universities, subscriptions, reports, monitoring, and global defaults.</p>
        </div>
      </div>

      {error ? <div className="alert">{error}</div> : null}
      {loading ? (
        <LoadingState title="Loading system administration" description="Fetching platform overview, monitoring, universities, and audit logs…" />
      ) : (
        renderSection()
      )}

      {!canManageSystem ? <div className="alert">You do not have platform management permission.</div> : null}
    </article>
  )
}
