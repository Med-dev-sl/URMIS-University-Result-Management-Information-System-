import { useMemo, useState } from 'react'
import { getRegistrationStatus, validateSelection } from './registrationModuleUtils.js'

const availableCourses = [
  { id: 1, code: 'CSC401', title: 'Artificial Intelligence', credits: 3, prerequisite: 'CSC301', prerequisiteMet: true, status: 'Available' },
  { id: 2, code: 'CSC403', title: 'Software Engineering', credits: 3, prerequisite: 'CSC302', prerequisiteMet: false, status: 'Hold' },
  { id: 3, code: 'MTH401', title: 'Operations Research', credits: 2, prerequisite: null, prerequisiteMet: true, status: 'Available' },
  { id: 4, code: 'CSC405', title: 'Distributed Systems', credits: 3, prerequisite: 'CSC401', prerequisiteMet: true, status: 'Available' },
]

const registrationHistory = [
  { id: 1, period: '2024/2025 Sem 1', status: 'Approved', credits: 14 },
  { id: 2, period: '2023/2024 Sem 2', status: 'Approved', credits: 16 },
]

export default function RegistrationView() {
  const [registrationOpen, setRegistrationOpen] = useState(true)
  const [lateRegistration, setLateRegistration] = useState(false)
  const [selectedCourses, setSelectedCourses] = useState([availableCourses[0], availableCourses[2]])
  const [search, setSearch] = useState('')

  const selectedValidation = useMemo(() => validateSelection(selectedCourses), [selectedCourses])
  const status = useMemo(() => getRegistrationStatus(registrationOpen, lateRegistration), [registrationOpen, lateRegistration])

  const filteredCourses = availableCourses.filter((course) => {
    const query = search.toLowerCase()
    return query === '' || [course.code, course.title, course.status].join(' ').toLowerCase().includes(query)
  })

  const toggleCourse = (course) => {
    setSelectedCourses((current) => {
      const exists = current.some((item) => item.id === course.id)
      return exists ? current.filter((item) => item.id !== course.id) : [...current, course]
    })
  }

  return (
    <section className="student-module-panel">
      <div className="student-hero">
        <div>
          <p className="eyebrow">Course registration</p>
          <h2>Registration center</h2>
          <p className="panel-subtitle">Review registration period controls, choose courses, validate prerequisites, and track approvals.</p>
        </div>
        <div className="student-hero-badge">
          <strong>{status}</strong>
          <span>{selectedValidation.creditLoad} credits selected</span>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-meta"><span className="stat-label">Period</span></div>
          <div className="stat-value">{status}</div>
          <p className="panel-subtitle">Semester registration window</p>
        </div>
        <div className="stat-card">
          <div className="stat-meta"><span className="stat-label">Credit load</span></div>
          <div className="stat-value">{selectedValidation.creditLoad}</div>
          <p className="panel-subtitle">Current selection</p>
        </div>
        <div className="stat-card">
          <div className="stat-meta"><span className="stat-label">Validation</span></div>
          <div className="stat-value">{selectedValidation.valid ? 'Valid' : 'Review'}</div>
          <p className="panel-subtitle">Prerequisite and credit checks</p>
        </div>
        <div className="stat-card">
          <div className="stat-meta"><span className="stat-label">Approval</span></div>
          <div className="stat-value">Pending</div>
          <p className="panel-subtitle">Awaiting faculty review</p>
        </div>
      </div>

      <div className="content-grid">
        <div className="panel">
          <div className="panel-header">
            <h3>Registration controls</h3>
            <span className="pill">Mock API</span>
          </div>
          <div className="student-tools">
            <div className="student-tools-row">
              <button type="button" className="primary-button" onClick={() => setRegistrationOpen((current) => !current)}>{registrationOpen ? 'Close registration' : 'Open registration'}</button>
              <button type="button" className="secondary-button" onClick={() => setLateRegistration((current) => !current)}>{lateRegistration ? 'Disable late reg.' : 'Enable late registration'}</button>
            </div>
            <div className="student-tools-row">
              <button type="button" className="secondary-button">Add & Drop</button>
              <button type="button" className="secondary-button">Submit registration</button>
            </div>
            {selectedValidation.errors.length > 0 && (
              <div className="alert">{selectedValidation.errors.join(' • ')}</div>
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Course selection</h3>
            <span className="pill">Selection</span>
          </div>
          <input className="field-input" placeholder="Search courses" value={search} onChange={(event) => setSearch(event.target.value)} />
          <div className="student-tools" style={{ marginTop: '12px' }}>
            {filteredCourses.map((course) => {
              const isSelected = selectedCourses.some((item) => item.id === course.id)
              return (
                <div key={course.id} className={`info-card ${isSelected ? 'selected-card' : ''}`}>
                  <div className="student-tools-row" style={{ justifyContent: 'space-between' }}>
                    <div>
                      <strong>{course.code} · {course.title}</strong>
                      <p className="panel-subtitle">{course.credits} credits · {course.prerequisite || 'No prerequisite'}</p>
                    </div>
                    <button type="button" className="secondary-button" onClick={() => toggleCourse(course)}>{isSelected ? 'Remove' : 'Add'}</button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="content-grid">
        <div className="panel">
          <div className="panel-header">
            <h3>Selected courses</h3>
            <span className="pill">Draft</span>
          </div>
          <div className="table-card">
            <table className="data-table">
              <thead><tr><th>Code</th><th>Course</th><th>Credits</th><th>Prerequisite</th></tr></thead>
              <tbody>
                {selectedCourses.map((course) => (
                  <tr key={course.id}><td>{course.code}</td><td>{course.title}</td><td>{course.credits}</td><td>{course.prerequisite || '—'}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Registration history</h3>
            <span className="pill">Reports</span>
          </div>
          <div className="table-card">
            <table className="data-table">
              <thead><tr><th>Period</th><th>Status</th><th>Credits</th></tr></thead>
              <tbody>
                {registrationHistory.map((entry) => (
                  <tr key={entry.id}><td>{entry.period}</td><td>{entry.status}</td><td>{entry.credits}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
