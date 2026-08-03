import { useEffect, useMemo, useRef, useState } from 'react'

const ROLE_OPTIONS = [
  'Students',
  'Lecturers',
  'Head of Department',
  'Dean',
  'Examination Officer',
  'Registrar',
  'Finance',
  'University Administrator',
  'Platform Administrator',
]

const initialUsers = [
  {
    id: 1,
    fullName: 'Aisha Kamara',
    email: 'aisha.kamara@urmis.edu',
    role: 'Students',
    department: 'Computer Science',
    status: 'Active',
    phone: '+233 20 111 2222',
    lastLogin: '10 mins ago',
    joinDate: '2024-01-15',
    permissions: ['student:view', 'result:view', 'profile:view'],
    profileSummary: 'Prospective student with active assessment access.',
    roleHistory: ['Student', 'Applicant'],
    activity: [
      { title: 'Signed in', detail: 'Verified student portal access' },
      { title: 'Updated profile', detail: 'Changed phone number' },
    ],
  },
  {
    id: 2,
    fullName: 'Dr. Daniel Owusu',
    email: 'daniel.owusu@urmis.edu',
    role: 'Lecturers',
    department: 'Mathematics',
    status: 'Active',
    phone: '+233 24 333 4444',
    lastLogin: '1 hour ago',
    joinDate: '2022-09-03',
    permissions: ['result:enter', 'course:view', 'profile:view'],
    profileSummary: 'Lecturer responsible for semester course grading.',
    roleHistory: ['Lecturer', 'Course Coordinator'],
    activity: [
      { title: 'Submitted grades', detail: 'Uploaded Semester 1 marks' },
      { title: 'Reviewed dossier', detail: 'Checked student appeals' },
    ],
  },
  {
    id: 3,
    fullName: 'Prof. Grace Mensah',
    email: 'grace.mensah@urmis.edu',
    role: 'Head of Department',
    department: 'Engineering',
    status: 'Active',
    phone: '+233 27 555 6666',
    lastLogin: '3 hours ago',
    joinDate: '2021-04-12',
    permissions: ['department:view', 'approval:manage', 'profile:view'],
    profileSummary: 'Department head supervising academic approvals.',
    roleHistory: ['Lecturer', 'Head of Department'],
    activity: [
      { title: 'Approved curriculum', detail: 'Validated departmental proposal' },
      { title: 'Scheduled review', detail: 'Planned faculty meeting' },
    ],
  },
  {
    id: 4,
    fullName: 'Dr. Samuel Boateng',
    email: 'samuel.boateng@urmis.edu',
    role: 'Dean',
    department: 'Faculty Office',
    status: 'Active',
    phone: '+233 26 777 8888',
    lastLogin: 'Yesterday',
    joinDate: '2019-08-21',
    permissions: ['faculty:view', 'report:view', 'profile:view'],
    profileSummary: 'Dean overseeing faculty-wide decisions and reporting.',
    roleHistory: ['Head of Department', 'Dean'],
    activity: [
      { title: 'Approved report', detail: 'Signed off on faculty review' },
      { title: 'Reviewed budget', detail: 'Checked resource deployment' },
    ],
  },
  {
    id: 5,
    fullName: 'Nadia Asante',
    email: 'nadia.asante@urmis.edu',
    role: 'Examination Officer',
    department: 'Examinations',
    status: 'Pending',
    phone: '+233 23 909 1011',
    lastLogin: '2 days ago',
    joinDate: '2023-11-06',
    permissions: ['exams:manage', 'result:review', 'profile:view'],
    profileSummary: 'Oversees scheduling and result verification workflows.',
    roleHistory: ['Registrar Assistant', 'Examination Officer'],
    activity: [
      { title: 'Created timetable', detail: 'Published exam schedule' },
      { title: 'Flagged discrepancy', detail: 'Raised issue for review' },
    ],
  },
  {
    id: 6,
    fullName: 'Moses Tetteh',
    email: 'moses.tetteh@urmis.edu',
    role: 'Registrar',
    department: 'Registrar Office',
    status: 'Active',
    phone: '+233 20 121 1314',
    lastLogin: '3 days ago',
    joinDate: '2018-02-17',
    permissions: ['student:manage', 'documents:view', 'profile:view'],
    profileSummary: 'Registrar managing student records and official documents.',
    roleHistory: ['Administrative Assistant', 'Registrar'],
    activity: [
      { title: 'Verified transcript', detail: 'Approved transcript request' },
      { title: 'Archived document', detail: 'Stored signed document set' },
    ],
  },
  {
    id: 7,
    fullName: 'Rebecca Fosu',
    email: 'rebecca.fosu@urmis.edu',
    role: 'Finance',
    department: 'Finance',
    status: 'Suspended',
    phone: '+233 24 151 1617',
    lastLogin: '1 week ago',
    joinDate: '2020-06-08',
    permissions: ['fee:view', 'invoice:manage', 'profile:view'],
    profileSummary: 'Finance officer handling fee records and reimbursement requests.',
    roleHistory: ['Accountant', 'Finance'],
    activity: [
      { title: 'Updated invoice', detail: 'Adjusted outstanding balance' },
      { title: 'Paused access', detail: 'Suspended due to review' },
    ],
  },
  {
    id: 8,
    fullName: 'Ibrahim Salifu',
    email: 'ibrahim.salifu@urmis.edu',
    role: 'University Administrator',
    department: 'Administration',
    status: 'Active',
    phone: '+233 27 181 1910',
    lastLogin: '30 mins ago',
    joinDate: '2017-10-02',
    permissions: ['system:view', 'user:manage', 'profile:view'],
    profileSummary: 'University administrator overseeing cross-department administration.',
    roleHistory: ['Administrator', 'University Administrator'],
    activity: [
      { title: 'Configured module', detail: 'Enabled new admin views' },
      { title: 'Updated policy', detail: 'Revised approval checklist' },
    ],
  },
  {
    id: 9,
    fullName: 'Kofi Boateng',
    email: 'kofi.boateng@urmis.edu',
    role: 'Platform Administrator',
    department: 'IT Operations',
    status: 'Active',
    phone: '+233 20 202 2122',
    lastLogin: '6 mins ago',
    joinDate: '2016-01-22',
    permissions: ['system:view', 'system:manage', 'profile:view'],
    profileSummary: 'Platform administrator maintaining system-wide access and configuration.',
    roleHistory: ['Support Engineer', 'Platform Administrator'],
    activity: [
      { title: 'Reviewed logs', detail: 'Checked failed sign-in events' },
      { title: 'Rolled out change', detail: 'Applied security patch' },
    ],
  },
]

const emptyForm = {
  fullName: '',
  email: '',
  role: 'Students',
  department: '',
  phone: '',
  status: 'Active',
  profileSummary: '',
}

function normalizeUser(item) {
  return {
    id: item.id,
    fullName: item.full_name || item.name || 'Unnamed user',
    email: item.email || '—',
    role: item.role || item.role_name || 'Unknown',
    department: item.department?.name || item.department || 'General',
    status: item.status ? String(item.status).charAt(0).toUpperCase() + String(item.status).slice(1) : 'Unknown',
    phone: item.phone || item.contact_phone || '—',
    lastLogin: item.last_login || item.lastLogin || 'Unknown',
    joinDate: item.created_at ? item.created_at.slice(0, 10) : item.joinDate || 'Unknown',
    permissions: Array.isArray(item.permissions) ? item.permissions : [],
    profileSummary: item.profileSummary || item.profile_summary || 'User profile initialized.',
    roleHistory: item.role_history || item.roleHistory || [item.role || 'Unknown'],
    activity: Array.isArray(item.activity) ? item.activity : [],
  }
}

export default function UserManagementView() {
  const [users, setUsers] = useState(initialUsers)
  const [activeRole, setActiveRole] = useState('All')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [departmentFilter, setDepartmentFilter] = useState('All')
  const [selectedUser, setSelectedUser] = useState(initialUsers[0])
  const [selectedIds, setSelectedIds] = useState([])
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState('create')
  const [formState, setFormState] = useState(emptyForm)
  const [notice, setNotice] = useState('Manage university users with role-aware views, auditing, and quick actions.')
  const [roleModalOpen, setRoleModalOpen] = useState(false)
  const [roleDraft, setRoleDraft] = useState('Students')
  const [error, setError] = useState('')
  const importInputRef = useRef(null)

  useEffect(() => {
    let active = true

    const loadUsers = async () => {
      try {
        const response = await fetch('/api/users')
        if (!response.ok) {
          const body = await response.json().catch(() => ({}))
          throw new Error(body.message || 'Unable to load users.')
        }

        const data = await response.json()
        if (active && Array.isArray(data)) {
          setUsers(data.map(normalizeUser))
          setSelectedUser(data.length ? normalizeUser(data[0]) : null)
          setError('')
        }
      } catch (fetchError) {
        if (active) {
          setError(fetchError.message || 'Unable to load user directory.')
          setNotice('Unable to load live user directory, using local preview data.')
        }
      }
    }

    void loadUsers()
    return () => {
      active = false
    }
  }, [])

  const departments = useMemo(() => ['All', ...Array.from(new Set(users.map((user) => user.department)))], [users])

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesRole = activeRole === 'All' || user.role === activeRole
      const matchesSearch = search.trim() === '' || [user.fullName, user.email, user.department, user.role].join(' ').toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'All' || user.status === statusFilter
      const matchesDepartment = departmentFilter === 'All' || user.department === departmentFilter
      return matchesRole && matchesSearch && matchesStatus && matchesDepartment
    })
  }, [users, activeRole, search, statusFilter, departmentFilter])

  const stats = useMemo(() => [
    { label: 'Total users', value: users.length, detail: 'Registered accounts' },
    { label: 'Active', value: users.filter((user) => user.status === 'Active').length, detail: 'Ready for work' },
    { label: 'Suspended', value: users.filter((user) => user.status === 'Suspended').length, detail: 'Needs review' },
    { label: 'Pending', value: users.filter((user) => user.status === 'Pending').length, detail: 'Awaiting access' },
  ], [users])

  const openCreate = () => {
    setFormMode('create')
    setFormState(emptyForm)
    setFormOpen(true)
  }

  const openEdit = (user) => {
    setFormMode('edit')
    setFormState({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      department: user.department,
      phone: user.phone,
      status: user.status,
      profileSummary: user.profileSummary,
    })
    setSelectedUser(user)
    setFormOpen(true)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (formMode === 'create') {
      const newUser = {
        id: Date.now(),
        fullName: formState.fullName,
        email: formState.email,
        role: formState.role,
        department: formState.department || 'General',
        status: formState.status,
        phone: formState.phone,
        lastLogin: 'Just created',
        joinDate: new Date().toISOString().slice(0, 10),
        permissions: ['profile:view'],
        profileSummary: formState.profileSummary || 'New user profile ready for onboarding.',
        roleHistory: [formState.role],
        activity: [{ title: 'Created user', detail: 'Added through admin console' }],
      }
      setUsers((current) => [newUser, ...current])
      setSelectedUser(newUser)
      setNotice(`${newUser.fullName} has been added to the user directory.`)
    } else if (selectedUser) {
      setUsers((current) => current.map((user) => user.id === selectedUser.id ? { ...user, ...{
        fullName: formState.fullName,
        email: formState.email,
        role: formState.role,
        department: formState.department,
        phone: formState.phone,
        status: formState.status,
        profileSummary: formState.profileSummary,
      } } : user))
      setNotice(`${formState.fullName} has been updated.`)
    }
    setFormOpen(false)
    setFormState(emptyForm)
  }

  const handleDelete = (user) => {
    setUsers((current) => current.filter((item) => item.id !== user.id))
    if (selectedUser?.id === user.id) {
      setSelectedUser(null)
    }
    setNotice(`${user.fullName} was removed from the directory.`)
  }

  const handleStatus = (user, nextStatus) => {
    setUsers((current) => current.map((item) => item.id === user.id ? { ...item, status: nextStatus } : item))
    setSelectedUser((current) => current && current.id === user.id ? { ...current, status: nextStatus } : current)
    setNotice(`${user.fullName} is now ${nextStatus.toLowerCase()}.`)
  }

  const handleResetPassword = (user) => {
    setNotice(`A password reset link was sent to ${user.email}.`)
  }

  const openAssignRole = (user) => {
    setSelectedUser(user)
    setRoleDraft(user.role)
    setRoleModalOpen(true)
  }

  const saveRole = () => {
    if (!selectedUser) return
    setUsers((current) => current.map((user) => user.id === selectedUser.id ? { ...user, role: roleDraft, roleHistory: [roleDraft, ...(user.roleHistory || [])] } : user))
    setSelectedUser((current) => current && current.id === selectedUser.id ? { ...current, role: roleDraft, roleHistory: [roleDraft, ...(current.roleHistory || [])] } : current)
    setRoleModalOpen(false)
    setNotice(`${selectedUser.fullName} has been assigned the ${roleDraft} role.`)
  }

  const toggleSelect = (id) => {
    setSelectedIds((current) => current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id])
  }

  const applyBulkAction = (action) => {
    if (!selectedIds.length) return
    setUsers((current) => current.map((user) => selectedIds.includes(user.id) ? {
      ...user,
      status: action === 'activate' ? 'Active' : action === 'suspend' ? 'Suspended' : user.status,
    } : user))
    setSelectedIds([])
    setNotice(`Applied ${action} to ${selectedIds.length} selected users.`)
  }

  const handleExport = () => {
    const csv = ['fullName,email,role,department,status', ...users.map((user) => [user.fullName, user.email, user.role, user.department, user.status].join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'urmis-users.csv'
    link.click()
    URL.revokeObjectURL(link.href)
    setNotice('User list exported as CSV.')
  }

  const handleImport = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const fileName = file.name
    setNotice(`Import ready for ${fileName}. Connect this action to your backend endpoint when user import is enabled.`)
    event.target.value = ''
  }

  return (
    <article className="panel user-management-panel">
      <div className="panel-header">
        <div>
          <h3>User management</h3>
          <p className="field-hint">Create, review, and govern student and staff accounts across every institutional role.</p>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value">{stat.value}</div>
            <div className="field-hint">{stat.detail}</div>
          </div>
        ))}
      </div>

      {error ? <div className="alert">{error}</div> : null}
      <div className="notice-banner">{notice}</div>

      <div className="topbar-actions user-toolbar" style={{ marginBottom: '16px' }}>
        <button className="primary-button" type="button" onClick={openCreate}>Create user</button>
        <button className="secondary-button" type="button" onClick={() => selectedIds.length && applyBulkAction('suspend')}>Bulk actions</button>
        <button className="secondary-button" type="button" onClick={() => importInputRef.current?.click()}>Import users</button>
        <button className="secondary-button" type="button" onClick={handleExport}>Export users</button>
        <input type="file" ref={importInputRef} style={{ display: 'none' }} accept=".csv,.txt" onChange={handleImport} />
      </div>

      <div className="user-role-tabs" role="tablist" aria-label="User roles">
        <button type="button" className={`tab-item ${activeRole === 'All' ? 'active' : ''}`} onClick={() => setActiveRole('All')}>All</button>
        {ROLE_OPTIONS.map((role) => (
          <button key={role} type="button" className={`tab-item ${activeRole === role ? 'active' : ''}`} onClick={() => setActiveRole(role)}>{role}</button>
        ))}
      </div>

      <div className="user-filters">
        <input className="field-input" placeholder="Search users" value={search} onChange={(event) => setSearch(event.target.value)} />
        <select className="field-input" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="All">All statuses</option>
          <option value="Active">Active</option>
          <option value="Suspended">Suspended</option>
          <option value="Pending">Pending</option>
        </select>
        <select className="field-input" value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)}>
          {departments.map((department) => <option key={department} value={department}>{department === 'All' ? 'All departments' : department}</option>)}
        </select>
      </div>

      {selectedIds.length ? (
        <div className="bulk-actions-card">
          <strong>{selectedIds.length} selected</strong>
          <div className="topbar-actions">
            <button className="secondary-button" type="button" onClick={() => applyBulkAction('activate')}>Activate</button>
            <button className="secondary-button" type="button" onClick={() => applyBulkAction('suspend')}>Suspend</button>
            <button className="secondary-button" type="button" onClick={() => {
              setUsers((current) => current.filter((user) => !selectedIds.includes(user.id)))
              setSelectedIds([])
              setNotice('Selected users were removed.')
            }}>Delete</button>
          </div>
        </div>
      ) : null}

      <div className="user-management-grid">
        <div className="panel user-list-panel">
          <div className="panel-header">
            <h4>Directory</h4>
            <span className="field-hint">{filteredUsers.length} matches</span>
          </div>
          <div className="user-list">
            {filteredUsers.map((user) => (
              <div key={user.id} className={`user-list-card ${selectedUser?.id === user.id ? 'selected' : ''}`}>
                <label className="checkbox-pill">
                  <input type="checkbox" checked={selectedIds.includes(user.id)} onChange={() => toggleSelect(user.id)} />
                </label>
                <div className="user-card-main">
                  <div className="user-avatar">{user.fullName.split(' ').map((chunk) => chunk[0]).slice(0, 2).join('')}</div>
                  <div>
                    <strong>{user.fullName}</strong>
                    <div className="field-hint">{user.email}</div>
                    <div className="user-meta-row">
                      <span className="pill">{user.role}</span>
                      <span className="pill muted">{user.department}</span>
                      <span className={`pill status-${user.status.toLowerCase()}`}>{user.status}</span>
                    </div>
                  </div>
                </div>
                <div className="user-card-actions">
                  <button className="link-button" type="button" onClick={() => setSelectedUser(user)}>View profile</button>
                  <button className="link-button" type="button" onClick={() => openEdit(user)}>Edit</button>
                  <button className="link-button" type="button" onClick={() => handleDelete(user)}>Delete</button>
                </div>
                <div className="user-card-actions compact">
                  <button className="secondary-button" type="button" onClick={() => handleStatus(user, user.status === 'Active' ? 'Suspended' : 'Active')}>{user.status === 'Active' ? 'Suspend' : 'Activate'}</button>
                  <button className="secondary-button" type="button" onClick={() => handleResetPassword(user)}>Reset password</button>
                  <button className="secondary-button" type="button" onClick={() => openAssignRole(user)}>Assign role</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel profile-panel">
          {selectedUser ? (
            <>
              <div className="panel-header">
                <h4>Profile overview</h4>
                <span className="pill status-active">{selectedUser.status}</span>
              </div>
              <div className="profile-summary">
                <div className="profile-hero">
                  <div className="user-avatar large">{selectedUser.fullName.split(' ').map((chunk) => chunk[0]).slice(0, 2).join('')}</div>
                  <div>
                    <h5>{selectedUser.fullName}</h5>
                    <p>{selectedUser.role}</p>
                    <p className="field-hint">{selectedUser.department}</p>
                  </div>
                </div>
                <p className="field-hint">{selectedUser.profileSummary}</p>
              </div>

              <div className="profile-grid">
                <div className="info-card">
                  <h6>Profile</h6>
                  <p><strong>Email:</strong> {selectedUser.email}</p>
                  <p><strong>Phone:</strong> {selectedUser.phone}</p>
                  <p><strong>Joined:</strong> {selectedUser.joinDate}</p>
                  <p><strong>Last login:</strong> {selectedUser.lastLogin}</p>
                </div>
                <div className="info-card">
                  <h6>Permission viewer</h6>
                  <div className="pill-list">
                    {selectedUser.permissions.map((permission) => <span key={permission} className="pill">{permission}</span>)}
                  </div>
                </div>
              </div>

              <div className="info-card">
                <h6>Activity timeline</h6>
                <ul className="timeline-list">
                  {selectedUser.activity.map((entry) => (
                    <li key={`${entry.title}-${entry.detail}`}>
                      <strong>{entry.title}</strong>
                      <div className="field-hint">{entry.detail}</div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="info-card">
                <h6>Role history</h6>
                <div className="pill-list">
                  {selectedUser.roleHistory.map((entry) => <span key={entry} className="pill muted">{entry}</span>)}
                </div>
              </div>
            </>
          ) : (
            <div className="loading-card">Select a user to view their profile.</div>
          )}
        </div>
      </div>

      {formOpen ? (
        <div className="modal-overlay">
          <div className="modal-card" style={{ width: 'min(720px, calc(100% - 32px))', textAlign: 'left' }}>
            <div className="panel-header">
              <h3>{formMode === 'edit' ? 'Edit user profile' : 'Create user'}</h3>
            </div>
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                <label className="field-group">
                  <span className="field-label">Full name</span>
                  <input className="field-input" value={formState.fullName} onChange={(event) => setFormState((current) => ({ ...current, fullName: event.target.value }))} required />
                </label>
                <label className="field-group">
                  <span className="field-label">Email</span>
                  <input className="field-input" type="email" value={formState.email} onChange={(event) => setFormState((current) => ({ ...current, email: event.target.value }))} required />
                </label>
                <label className="field-group">
                  <span className="field-label">Role</span>
                  <select className="field-input" value={formState.role} onChange={(event) => setFormState((current) => ({ ...current, role: event.target.value }))}>
                    {ROLE_OPTIONS.map((role) => <option key={role} value={role}>{role}</option>)}
                  </select>
                </label>
                <label className="field-group">
                  <span className="field-label">Department</span>
                  <input className="field-input" value={formState.department} onChange={(event) => setFormState((current) => ({ ...current, department: event.target.value }))} />
                </label>
                <label className="field-group">
                  <span className="field-label">Phone</span>
                  <input className="field-input" value={formState.phone} onChange={(event) => setFormState((current) => ({ ...current, phone: event.target.value }))} />
                </label>
                <label className="field-group">
                  <span className="field-label">Status</span>
                  <select className="field-input" value={formState.status} onChange={(event) => setFormState((current) => ({ ...current, status: event.target.value }))}>
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </label>
              </div>
              <label className="field-group">
                <span className="field-label">Profile summary</span>
                <textarea className="field-input" rows={3} value={formState.profileSummary} onChange={(event) => setFormState((current) => ({ ...current, profileSummary: event.target.value }))} />
              </label>
              <div className="topbar-actions">
                <button className="primary-button" type="submit">Save user</button>
                <button className="secondary-button" type="button" onClick={() => setFormOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {roleModalOpen ? (
        <div className="modal-overlay">
          <div className="modal-card" style={{ width: 'min(420px, calc(100% - 32px))' }}>
            <h3>Assign role</h3>
            <label className="field-group">
              <span className="field-label">Select new role</span>
              <select className="field-input" value={roleDraft} onChange={(event) => setRoleDraft(event.target.value)}>
                {ROLE_OPTIONS.map((role) => <option key={role} value={role}>{role}</option>)}
              </select>
            </label>
            <div className="topbar-actions">
              <button className="primary-button" type="button" onClick={saveRole}>Save role</button>
              <button className="secondary-button" type="button" onClick={() => setRoleModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  )
}
