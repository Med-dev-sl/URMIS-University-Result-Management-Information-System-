import { useMemo, useState } from 'react'

const staffProfiles = [
  { id: 1, name: 'Dr. Amina Yusuf', role: 'Dean of Science', status: 'Active' },
  { id: 2, name: 'Prof. Daniel Addo', role: 'Head of Department', status: 'Active' },
  { id: 3, name: 'Mrs. Evelyn Boateng', role: 'Exam Officer', status: 'Pending review' },
  { id: 4, name: 'Mr. Kofi Mensah', role: 'Lecturer', status: 'Active' },
]

export default function StaffView() {
  const [search, setSearch] = useState('')

  const filteredProfiles = useMemo(() => {
    return staffProfiles.filter((profile) => `${profile.name} ${profile.role} ${profile.status}`.toLowerCase().includes(search.toLowerCase()))
  }, [search])

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
                  <div className="user-avatar">{profile.name.split(' ').map((word) => word[0]).slice(0, 2).join('')}</div>
                  <div>
                    <strong>{profile.name}</strong>
                    <p className="panel-subtitle">{profile.role}</p>
                  </div>
                </div>
                <span className="pill">{profile.status}</span>
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
            <li className="timeline-item"><strong>Deans</strong><span>Academic leadership aligned</span><small>1</small></li>
            <li className="timeline-item"><strong>Heads of Department</strong><span>Department reviews active</span><small>1</small></li>
            <li className="timeline-item"><strong>Lecturers</strong><span>Teaching delivery status stable</span><small>1</small></li>
          </ul>
        </div>
      </div>
    </section>
  )
}
