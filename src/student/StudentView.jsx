import { useMemo, useState } from 'react'
import { useAuth } from '../auth/useAuth.js'
import { buildProgressTrend, getSectionById, summarizeRegisteredCourses } from './studentModuleUtils.js'

const studentSections = [
  { id: 'dashboard', label: 'Student Dashboard', description: 'Overview of your academic activity' },
  { id: 'profile', label: 'Student Profile', description: 'Personal, contact, and emergency information' },
  { id: 'registration', label: 'Course Registration', description: 'Select and review your semester courses' },
  { id: 'courses', label: 'Registered Courses', description: 'Current course list and schedules' },
  { id: 'history', label: 'Academic History', description: 'Past semesters, awards, and achievements' },
  { id: 'results', label: 'Results', description: 'Performance by course and semester' },
  { id: 'cgpa', label: 'CGPA', description: 'Current grade point average overview' },
  { id: 'transcript', label: 'Transcript Requests', description: 'Official transcript requests and status' },
  { id: 'complaints', label: 'Complaints', description: 'Track student support and issue resolution' },
  { id: 'notifications', label: 'Notifications', description: 'Announcements and deadlines' },
  { id: 'documents', label: 'Documents', description: 'Certificates and supporting papers' },
  { id: 'downloads', label: 'Downloads', description: 'Forms and important files' },
  { id: 'fees', label: 'Fees Overview', description: 'Payments, balances, and due dates' },
  { id: 'progress', label: 'Academic Progress', description: 'Milestones and semester trajectory' },
]

const profileData = {
  name: 'Amina Hassan',
  studentId: 'STU-2024-001',
  programme: 'Computer Science',
  level: '400 Level',
  cohort: '2024/2025',
  email: 'amina.hassan@urmis.edu',
  phone: '+233 20 123 4567',
  address: 'Block B, Hall 2, University Estate',
  guardian: 'Mrs. Salma Hassan',
  admissionStatus: 'Cleared',
}

const registeredCourses = [
  { code: 'CSC401', title: 'Artificial Intelligence', credits: 3, status: 'Registered', lecturer: 'Dr. Kwame Boateng' },
  { code: 'CSC403', title: 'Software Engineering', credits: 3, status: 'Registered', lecturer: 'Dr. Lydia Mensah' },
  { code: 'CSC405', title: 'Distributed Systems', credits: 3, status: 'Pending', lecturer: 'Prof. Daniel Asare' },
  { code: 'MTH401', title: 'Operations Research', credits: 2, status: 'Registered', lecturer: 'Dr. Grace Annan' },
]

const results = [
  { semester: '2024/2025 Sem 1', course: 'AI', marks: 82, grade: 'A' },
  { semester: '2024/2025 Sem 1', course: 'Database Systems', marks: 76, grade: 'B+' },
  { semester: '2023/2024 Sem 2', course: 'Software Engineering', marks: 88, grade: 'A' },
  { semester: '2023/2024 Sem 2', course: 'Discrete Math', marks: 71, grade: 'B' },
  { semester: '2023/2024 Sem 1', course: 'Algorithms', marks: 79, grade: 'B+' },
  { semester: '2023/2024 Sem 1', course: 'Data Structures', marks: 84, grade: 'A' },
]

const transcriptRequests = [
  { id: 'TR-1001', type: 'Official Transcript', date: '2026-07-18', status: 'Approved' },
  { id: 'TR-1002', type: 'Semester Transcript', date: '2026-08-01', status: 'Pending' },
]

const complaints = [
  { id: 'CMP-001', topic: 'Fee statement mismatch', status: 'Resolved', date: '2026-07-14' },
  { id: 'CMP-002', topic: 'Course registration delay', status: 'Pending', date: '2026-07-28' },
]

const notifications = [
  { id: 1, title: 'Registration deadline approaching', detail: 'Complete your course registration by Friday.', date: '2026-08-02' },
  { id: 2, title: 'Transcript processing update', detail: 'Your official transcript request is under review.', date: '2026-08-01' },
]

const documents = [
  { name: 'Admission Letter', type: 'PDF', updated: '2024-09-03' },
  { name: 'Student ID Card', type: 'JPG', updated: '2024-09-10' },
]

const downloads = [
  { name: 'Course registration form', type: 'PDF' },
  { name: 'Transcript request form', type: 'DOCX' },
]

const feeSummary = [
  { label: 'Tuition', amount: 'GHS 4,800.00', status: 'Paid' },
  { label: 'Hostel', amount: 'GHS 1,250.00', status: 'Pending' },
  { label: 'Library', amount: 'GHS 180.00', status: 'Paid' },
]

const progressTrend = buildProgressTrend(results)

export default function StudentView() {
  const { user } = useAuth()
  const [activeSection, setActiveSection] = useState('dashboard')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const summary = useMemo(() => summarizeRegisteredCourses(registeredCourses), [])

  const filteredResults = useMemo(() => {
    return results.filter((item) => {
      const matchesSearch = search.trim() === '' || [item.course, item.semester, item.grade].join(' ').toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'All' || item.grade === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [search, statusFilter])

  const section = getSectionById(studentSections, activeSection)

  return (
    <section className="student-module-panel">
      <div className="student-hero">
        <div>
          <p className="eyebrow">Student portal</p>
          <h2>Welcome back, {user?.fullName || profileData.name}</h2>
          <p className="panel-subtitle">Manage your academic profile, registrations, results, and support requests in one place.</p>
        </div>
        <div className="student-hero-badge">
          <strong>{profileData.studentId}</strong>
          <span>{profileData.programme}</span>
        </div>
      </div>

      <div className="student-section-nav">
        {studentSections.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`tab-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => setActiveSection(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="notice-banner">Viewing {section.label}. This student workspace is frontend-only and uses mock academic data.</div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-meta"><span className="stat-label">Registered Courses</span></div>
          <div className="stat-value">{registeredCourses.length}</div>
          <p className="panel-subtitle">{summary.activeCount} active · {summary.pendingCount} pending</p>
        </div>
        <div className="stat-card">
          <div className="stat-meta"><span className="stat-label">Credits</span></div>
          <div className="stat-value">{summary.totalCredits}</div>
          <p className="panel-subtitle">Current semester load</p>
        </div>
        <div className="stat-card">
          <div className="stat-meta"><span className="stat-label">CGPA</span></div>
          <div className="stat-value">3.74</div>
          <p className="panel-subtitle">Excellent standing</p>
        </div>
        <div className="stat-card">
          <div className="stat-meta"><span className="stat-label">Pending Requests</span></div>
          <div className="stat-value">{transcriptRequests.filter((item) => item.status === 'Pending').length + complaints.filter((item) => item.status === 'Pending').length}</div>
          <p className="panel-subtitle">Transcript and complaints</p>
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
                <h4>Academic Snapshot</h4>
                <ul className="student-list">
                  <li className="student-item"><div><strong>Current Semester</strong><span>2024/2025 Semester 1</span></div><span className="student-badge">On track</span></li>
                  <li className="student-item"><div><strong>Next Deadline</strong><span>Course registration closes Friday</span></div><span className="student-badge">Urgent</span></li>
                  <li className="student-item"><div><strong>Finance Status</strong><span>Hostel balance pending</span></div><span className="student-badge">Pending</span></li>
                </ul>
              </div>
              <div className="panel">
                <h4>Recent Activities</h4>
                <ul className="timeline-list">
                  {notifications.map((item) => (
                    <li key={item.id} className="timeline-item">
                      <strong>{item.title}</strong>
                      <span>{item.detail}</span>
                      <small>{item.date}</small>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeSection === 'profile' && (
            <div className="profile-grid">
              {Object.entries(profileData).map(([key, value]) => (
                <div key={key} className="info-card">
                  <span className="stat-label">{key.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase())}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          )}

          {activeSection === 'registration' && (
            <div className="student-grid">
              <div className="panel">
                <h4>Available Courses</h4>
                <ul className="student-list">
                  {registeredCourses.map((course) => (
                    <li key={course.code} className="student-item">
                      <div><strong>{course.code} · {course.title}</strong><span>{course.lecturer}</span></div>
                      <span className="student-badge">{course.credits} credits</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="panel">
                <h4>Registration Checklist</h4>
                <ul className="timeline-list">
                  <li className="timeline-item"><strong>Advisor approval</strong><span>Pending confirmation</span></li>
                  <li className="timeline-item"><strong>Fee clearance</strong><span>Outstanding hostel balance</span></li>
                  <li className="timeline-item"><strong>Department review</strong><span>Queued for review</span></li>
                </ul>
              </div>
            </div>
          )}

          {activeSection === 'courses' && (
            <div className="table-card">
              <table className="data-table">
                <thead>
                  <tr><th>Code</th><th>Course</th><th>Credits</th><th>Status</th><th>Lecturer</th></tr>
                </thead>
                <tbody>
                  {registeredCourses.map((course) => (
                    <tr key={course.code}><td>{course.code}</td><td>{course.title}</td><td>{course.credits}</td><td>{course.status}</td><td>{course.lecturer}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeSection === 'history' && (
            <ul className="student-list">
              <li className="student-item"><div><strong>2023/2024 Session</strong><span>Completed 2nd semester with distinction</span></div><span className="student-badge">Honours</span></li>
              <li className="student-item"><div><strong>2022/2023 Session</strong><span>Completed first-year foundation courses</span></div><span className="student-badge">Completed</span></li>
            </ul>
          )}

          {activeSection === 'results' && (
            <div className="student-tools">
              <div className="student-tools-row">
                <input className="field-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search results" />
                <select className="field-input" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                  <option value="All">All grades</option>
                  <option value="A">A</option>
                  <option value="B+">B+</option>
                  <option value="B">B</option>
                </select>
              </div>
              <div className="table-card">
                <table className="data-table">
                  <thead><tr><th>Semester</th><th>Course</th><th>Marks</th><th>Grade</th></tr></thead>
                  <tbody>
                    {filteredResults.map((item) => (
                      <tr key={`${item.semester}-${item.course}`}><td>{item.semester}</td><td>{item.course}</td><td>{item.marks}</td><td>{item.grade}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'cgpa' && (
            <div className="student-grid">
              <div className="panel">
                <h4>Current CGPA</h4>
                <div className="stat-value">3.74</div>
                <p className="panel-subtitle">Maintained above the minimum requirement for the programme.</p>
              </div>
              <div className="panel">
                <h4>Trend</h4>
                <div className="sparkline">
                  {progressTrend.map((item) => (
                    <div key={`${item.semester}-${item.course}`} className="sparkbar" style={{ height: `${item.height}%` }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'transcript' && (
            <div className="table-card">
              <table className="data-table">
                <thead><tr><th>ID</th><th>Type</th><th>Date</th><th>Status</th></tr></thead>
                <tbody>
                  {transcriptRequests.map((item) => (
                    <tr key={item.id}><td>{item.id}</td><td>{item.type}</td><td>{item.date}</td><td>{item.status}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeSection === 'complaints' && (
            <div className="table-card">
              <table className="data-table">
                <thead><tr><th>ID</th><th>Topic</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                  {complaints.map((item) => (
                    <tr key={item.id}><td>{item.id}</td><td>{item.topic}</td><td>{item.status}</td><td>{item.date}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeSection === 'notifications' && (
            <ul className="student-list">
              {notifications.map((item) => (
                <li key={item.id} className="student-item"><div><strong>{item.title}</strong><span>{item.detail}</span></div><span className="student-badge">{item.date}</span></li>
              ))}
            </ul>
          )}

          {activeSection === 'documents' && (
            <div className="table-card">
              <table className="data-table">
                <thead><tr><th>Name</th><th>Type</th><th>Updated</th></tr></thead>
                <tbody>
                  {documents.map((item) => (
                    <tr key={item.name}><td>{item.name}</td><td>{item.type}</td><td>{item.updated}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeSection === 'downloads' && (
            <div className="table-card">
              <table className="data-table">
                <thead><tr><th>Name</th><th>Type</th></tr></thead>
                <tbody>
                  {downloads.map((item) => (
                    <tr key={item.name}><td>{item.name}</td><td>{item.type}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeSection === 'fees' && (
            <div className="student-grid">
              {feeSummary.map((entry) => (
                <div key={entry.label} className="info-card">
                  <span className="stat-label">{entry.label}</span>
                  <strong>{entry.amount}</strong>
                  <span className="pill">{entry.status}</span>
                </div>
              ))}
            </div>
          )}

          {activeSection === 'progress' && (
            <div className="student-grid">
              <div className="panel">
                <h4>Academic Progress</h4>
                <ul className="timeline-list">
                  <li className="timeline-item"><strong>Semester milestones</strong><span>70% of compulsory courses completed</span></li>
                  <li className="timeline-item"><strong>Research readiness</strong><span>Project proposal submitted</span></li>
                  <li className="timeline-item"><strong>Graduation outlook</strong><span>On track for completion in 2026</span></li>
                </ul>
              </div>
              <div className="panel">
                <h4>Support Actions</h4>
                <ul className="timeline-list">
                  <li className="timeline-item"><strong>Advisor meeting</strong><span>Book a consultation</span></li>
                  <li className="timeline-item"><strong>Document review</strong><span>Upload missing records</span></li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Student summary</h3>
            <span className="pill">Student</span>
          </div>
          <div className="info-card">
            <span className="stat-label">Current Standing</span>
            <strong>Good</strong>
            <p className="panel-subtitle">No active disciplinary action and consistent academic progress.</p>
          </div>
          <div className="info-card">
            <span className="stat-label">Next Action</span>
            <strong>Complete registration</strong>
            <p className="panel-subtitle">Finalize pending course selection before the Friday deadline.</p>
          </div>
          <div className="info-card">
            <span className="stat-label">Support</span>
            <strong>Academic office</strong>
            <p className="panel-subtitle">Visit the registry office for transcript and fee issues.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
