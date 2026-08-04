import { useEffect, useMemo, useState } from 'react'
import { fetchStaff } from '../shared/api.js'

export default function StaffView() {
  const [staffProfiles, setStaffProfiles] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadStaffProfiles = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await fetchStaff()
        setStaffProfiles(Array.isArray(data) ? data : [])
      } catch (err) {
        setError(err.message || 'Unable to load staff.')
      } finally {
        setLoading(false)
      }
    }

    loadStaffProfiles()
  }, [])

  const filteredProfiles = useMemo(() => {
    return staffProfiles.filter((profile) => {
      const searchable = `${profile.full_name ?? profile.name ?? ''} ${profile.role ?? ''} ${profile.status ?? ''}`.toLowerCase()
      return searchable.includes(search.toLowerCase())
    })
  }, [search, staffProfiles])

  return (
    <section className="student-module-panel">
      <div className="student-hero">
        <div>
          <p className="eyebrow">Staff module</p>
          <h2>Staff directory and status workspace</h2>
          <p className="panel-subtitle">Review staff roles, activity status, and department leadership from a single view.</p>
        </div>
        <div className="student-hero-badge">
          <strong>{staffProfiles.length}</strong>
          <span>Staff profiles</span>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3>Staff directory</h3>
          <span className="pill">Search</span>
        </div>
        <input className="field-input" placeholder="Search staff" value={search} onChange={(event) => setSearch(event.target.value)} />
      </div>

      {loading ? (
        <div className="panel">
          <p>Loading staff profiles...</p>
        </div>
      ) : error ? (
        <div className="panel auth-message error">
          <p>{error}</p>
        </div>
      ) : (
        <div className="content-grid">
          <div className="panel">
            <div className="panel-header">
              <h3>Profiles</h3>
              <span className="pill">{filteredProfiles.length} results</span>
            </div>
            <div className="stacked-list">
              {filteredProfiles.map((profile) => (
                <div key={profile.id} className="student-card">
                  <div className="student-card-main">
                    <div className="user-avatar">{(profile.full_name ?? profile.name ?? '??').split(' ').map((word) => word[0]).slice(0, 2).join('').toUpperCase()}</div>
                    <div>
                      <strong>{profile.full_name ?? profile.name}</strong>
                      <p className="panel-subtitle">{profile.role}</p>
                    </div>
                  </div>
                  <span className="pill">{profile.status ?? 'Active'}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <h3>Leadership overview</h3>
              <span className="pill">Roles</span>
            </div>
            <ul className="timeline-list">
              <li className="timeline-item"><strong>Deans</strong><span>Academic leadership aligned</span><small>{staffProfiles.filter((profile) => profile.role?.toLowerCase().includes('dean')).length}</small></li>
              <li className="timeline-item"><strong>Heads of Department</strong><span>Department reviews active</span><small>{staffProfiles.filter((profile) => profile.role?.toLowerCase().includes('head')).length}</small></li>
              <li className="timeline-item"><strong>Lecturers</strong><span>Teaching delivery status stable</span><small>{staffProfiles.filter((profile) => profile.role?.toLowerCase().includes('lecturer')).length}</small></li>
            </ul>
          </div>
        </div>
      )}
    </section>
  )
}
