import { useMemo, useState } from 'react'
import { useAuth } from '../auth/useAuth.js'
import { getAssessmentStats, getCourseSummary, getSectionById } from './lecturerModuleUtils.js'

const lecturerSections = [
  { id: 'dashboard', label: 'Dashboard', description: 'Teaching overview and deadlines' },
  { id: 'courses', label: 'Assigned Courses', description: 'Your teaching load and modules' },
  { id: 'students', label: 'Students', description: 'Class roster and student status' },
  { id: 'assessment', label: 'Assessment Entry', description: 'Create and update continuous assessments' },
  { id: 'attendance', label: 'Attendance', description: 'Class attendance tracking' },
  { id: 'results', label: 'Result Entry', description: 'Capture marks and comments' },
  { id: 'submitted', label: 'Submitted Results', description: 'Review results already submitted' },
  { id: 'history', label: 'Result History', description: 'Historical grading records' },
  { id: 'reports', label: 'Reports', description: 'Performance and summary reports' },
  { id: 'notifications', label: 'Notifications', description: 'Announcements and reminders' },
  { id: 'profile', label: 'Profile', description: 'Personal details and settings' },
]

const assignedCourses = [
  { code: 'CSC401', title: 'Artificial Intelligence', semester: '2024/2025 Sem 1', students: 82, assessments: 3, pendingResults: 2 },
  { code: 'CSC403', title: 'Software Engineering', semester: '2024/2025 Sem 1', students: 71, assessments: 2, pendingResults: 1 },
  { code: 'MTH401', title: 'Operations Research', semester: '2024/2025 Sem 1', students: 54, assessments: 4, pendingResults: 0 },
]

const studentRoster = [
  { name: 'Amina Hassan', id: 'STU-001', status: 'Active', average: '82%' },
  { name: 'Benedict Arthur', id: 'STU-002', status: 'At Risk', average: '68%' },
  { name: 'Cynthia Owusu', id: 'STU-003', status: 'Active', average: '90%' },
]

const resultEntries = [
  { student: 'Amina Hassan', course: 'CSC401', status: 'Submitted', marks: '82/100' },
  { student: 'Benedict Arthur', course: 'CSC401', status: 'Draft', marks: '70/100' },
  { student: 'Cynthia Owusu', course: 'CSC403', status: 'Pending', marks: '—' },
]

const notifications = [
  { id: 1, title: 'Result submission reminder', detail: 'Only 2 results remain pending for CSC401.', date: '2026-08-02' },
  { id: 2, title: 'Assessment schedule updated', detail: 'The mid-semester assessment has been moved to Friday.', date: '2026-08-01' },
]

export default function LecturerView() {
  const { user } = useAuth()
  const [activeSection, setActiveSection] = useState('dashboard')
  const [search, setSearch] = useState('')
  const [draftMode, setDraftMode] = useState(true)

  const courseSummary = useMemo(() => getCourseSummary(assignedCourses), [])
  const assessmentStats = useMemo(() => getAssessmentStats(resultEntries), [])
  const section = getSectionById(lecturerSections, activeSection)

  const filteredStudents = studentRoster.filter((student) => {
    const query = search.toLowerCase()
    return query === '' || [student.name, student.id, student.status].join(' ').toLowerCase().includes(query)
  })

  return (
    <section className="student-module-panel">
      <div className="student-hero">
        <div>
          <p className="eyebrow">Lecturer portal</p>
          <h2>Welcome, {user?.fullName || 'Dr. A. Mensah'}</h2>
          <p className="panel-subtitle">Manage course delivery, student assessment, and results from one responsive workspace.</p>
        </div>
        <div className="student-hero-badge">
          <strong>Lecturer</strong>
          <span>Department of Computing</span>
        </div>
      </div>

      <div className="student-section-nav">
        {lecturerSections.map((item) => (
          <button key={item.id} type="button" className={`tab-item ${activeSection === item.id ? 'active' : ''}`} onClick={() => setActiveSection(item.id)}>
            {item.label}
          </button>
        ))}
      </div>

      <div className="notice-banner">Viewing {section.label}. This lecturer workspace is frontend-only and uses mock teaching data.</div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-meta"><span className="stat-label">Assigned Courses</span></div>
          <div className="stat-value">{courseSummary.totalCourses}</div>
          <p className="panel-subtitle">{courseSummary.activeAssessments} assessed modules</p>
        </div>
        <div className="stat-card">
          <div className="stat-meta"><span className="stat-label">Pending Results</span></div>
          <div className="stat-value">{courseSummary.pendingResults}</div>
          <p className="panel-subtitle">Awaiting submission</p>
        </div>
        <div className="stat-card">
          <div className="stat-meta"><span className="stat-label">Submitted</span></div>
          <div className="stat-value">{assessmentStats.submitted}</div>
          <p className="panel-subtitle">Ready for review</p>
        </div>
        <div className="stat-card">
          <div className="stat-meta"><span className="stat-label">Drafts</span></div>
          <div className="stat-value">{assessmentStats.draft}</div>
          <p className="panel-subtitle">Still being finalized</p>
        </div>
      </div>

      <div className="content-grid">
        <div className="panel">
          <div className="panel-header">
            <h3>{section.label}</h3>
            <button type="button" className="secondary-button">Export</button>
          </div>

          {activeSection === 'dashboard' && (
            <div className="student-grid">
              <div className="panel">
                <h4>Course cards</h4>
                <div className="student-grid">
                  {assignedCourses.map((course) => (
                    <div key={course.code} className="info-card">
                      <span className="stat-label">{course.code}</span>
                      <strong>{course.title}</strong>
                      <p className="panel-subtitle">{course.students} students · {course.assessments} assessments</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="panel">
                <h4>Upcoming actions</h4>
                <ul className="timeline-list">
                  <li className="timeline-item"><strong>Submit pending results</strong><span>CSC401 still has 2 unsubmitted results</span></li>
                  <li className="timeline-item"><strong>Review attendance</strong><span>Weekly recap due by Friday</span></li>
                  <li className="timeline-item"><strong>Validate assessment marks</strong><span>Cross-check course rubric before approval</span></li>
                </ul>
              </div>
            </div>
          )}

          {activeSection === 'courses' && (
            <div className="student-grid">
              {assignedCourses.map((course) => (
                <div key={course.code} className="info-card">
                  <span className="stat-label">{course.code}</span>
                  <strong>{course.title}</strong>
                  <p className="panel-subtitle">{course.semester}</p>
                  <div className="pill-list">
                    <span className="pill">{course.students} students</span>
                    <span className="pill">{course.assessments} assessments</span>
                    <span className="pill">{course.pendingResults} pending results</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeSection === 'students' && (
            <div className="student-tools">
              <input className="field-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search students" />
              <div className="table-card">
                <table className="data-table">
                  <thead><tr><th>Name</th><th>ID</th><th>Status</th><th>Average</th></tr></thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={student.id}><td>{student.name}</td><td>{student.id}</td><td>{student.status}</td><td>{student.average}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'assessment' && (
            <div className="student-grid">
              <div className="panel">
                <h4>Assessment form</h4>
                <div className="student-tools">
                  <label className="stat-label" htmlFor="assessment-course">Course</label>
                  <select id="assessment-course" className="field-input">
                    <option>CSC401</option>
                    <option>CSC403</option>
                  </select>
                  <label className="stat-label" htmlFor="assessment-title">Assessment Title</label>
                  <input id="assessment-title" className="field-input" placeholder="Mid-semester test" />
                  <label className="stat-label" htmlFor="assessment-score">Max Score</label>
                  <input id="assessment-score" className="field-input" placeholder="40" />
                  <button type="button" className="primary-button">Save assessment</button>
                </div>
              </div>
              <div className="panel">
                <h4>Bulk upload</h4>
                <p className="panel-subtitle">Import marks from a spreadsheet for quick entry.</p>
                <button type="button" className="secondary-button">Upload CSV</button>
              </div>
            </div>
          )}

          {activeSection === 'attendance' && (
            <div className="table-card">
              <table className="data-table">
                <thead><tr><th>Student</th><th>Week 1</th><th>Week 2</th><th>Week 3</th></tr></thead>
                <tbody>
                  <tr><td>Amina Hassan</td><td>Present</td><td>Present</td><td>Absent</td></tr>
                  <tr><td>Benedict Arthur</td><td>Present</td><td>Absent</td><td>Present</td></tr>
                </tbody>
              </table>
            </div>
          )}

          {activeSection === 'results' && (
            <div className="student-tools">
              <div className="student-tools-row">
                <button type="button" className={`secondary-button ${draftMode ? 'active' : ''}`} onClick={() => setDraftMode(true)}>Draft results</button>
                <button type="button" className={`secondary-button ${!draftMode ? 'active' : ''}`} onClick={() => setDraftMode(false)}>Submit results</button>
              </div>
              <div className="table-card">
                <table className="data-table">
                  <thead><tr><th>Student</th><th>Course</th><th>Status</th><th>Marks</th></tr></thead>
                  <tbody>
                    {resultEntries.map((entry) => (
                      <tr key={`${entry.student}-${entry.course}`}><td>{entry.student}</td><td>{entry.course}</td><td>{entry.status}</td><td>{entry.marks}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'submitted' && (
            <div className="table-card">
              <table className="data-table">
                <thead><tr><th>Student</th><th>Course</th><th>Marks</th><th>Status</th></tr></thead>
                <tbody>
                  {resultEntries.filter((entry) => entry.status === 'Submitted').map((entry) => (
                    <tr key={`${entry.student}-${entry.course}`}><td>{entry.student}</td><td>{entry.course}</td><td>{entry.marks}</td><td>{entry.status}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeSection === 'history' && (
            <ul className="student-list">
              <li className="student-item"><div><strong>2023/2024 Sem 2</strong><span>Submitted final marks for 3 courses</span></div><span className="student-badge">Reviewed</span></li>
              <li className="student-item"><div><strong>2023/2024 Sem 1</strong><span>Uploaded corrections after moderation</span></div><span className="student-badge">Updated</span></li>
            </ul>
          )}

          {activeSection === 'reports' && (
            <div className="student-grid">
              <div className="panel">
                <h4>Performance report</h4>
                <p className="panel-subtitle">Average attendance is 83%, with 2 students requiring support.</p>
              </div>
              <div className="panel">
                <h4>Validation summary</h4>
                <p className="panel-subtitle">All current results have passed rubric validation and are ready for submission.</p>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <ul className="student-list">
              {notifications.map((item) => (
                <li key={item.id} className="student-item"><div><strong>{item.title}</strong><span>{item.detail}</span></div><span className="student-badge">{item.date}</span></li>
              ))}
            </ul>
          )}

          {activeSection === 'profile' && (
            <div className="profile-grid">
              <div className="info-card"><span className="stat-label">Name</span><strong>Dr. A. Mensah</strong></div>
              <div className="info-card"><span className="stat-label">Department</span><strong>Computing</strong></div>
              <div className="info-card"><span className="stat-label">Email</span><strong>amensah@urmis.edu</strong></div>
              <div className="info-card"><span className="stat-label">Office</span><strong>Block C, Room 12</strong></div>
            </div>
          )}
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Lecturer summary</h3>
            <span className="pill">Teaching</span>
          </div>
          <div className="info-card">
            <span className="stat-label">Current focus</span>
            <strong>Result submission</strong>
            <p className="panel-subtitle">Finalize pending results for CSC401 before the weekly review.</p>
          </div>
          <div className="info-card">
            <span className="stat-label">Support</span>
            <strong>Assessment office</strong>
            <p className="panel-subtitle">Use the validation tools before final submission.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
