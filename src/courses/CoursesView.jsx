import { useMemo, useState } from 'react'

const courseCatalog = [
  { id: 1, code: 'CSC401', title: 'Software Engineering', semester: '2026/2027', lecturers: 2, status: 'Active' },
  { id: 2, code: 'BUS221', title: 'Business Management', semester: '2026/2027', lecturers: 1, status: 'Review' },
  { id: 3, code: 'ENG301', title: 'Engineering Ethics', semester: '2026/2027', lecturers: 1, status: 'Draft' },
]

export default function CoursesView() {
  const [search, setSearch] = useState('')

  const filteredCourses = useMemo(() => {
    return courseCatalog.filter((course) => `${course.code} ${course.title} ${course.status}`.toLowerCase().includes(search.toLowerCase()))
  }, [search])

  return (
    <section className="student-module-panel">
      <div className="student-hero">
        <div>
          <p className="eyebrow">Courses module</p>
          <h2>Course catalogue and planning workspace</h2>
          <p className="panel-subtitle">Review available courses, assignments, and registration readiness in one place.</p>
        </div>
        <div className="student-hero-badge">
          <strong>{courseCatalog.length}</strong>
          <span>Courses listed</span>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3>Search courses</h3>
          <span className="pill">Catalogue</span>
        </div>
        <input className="field-input" placeholder="Search courses" value={search} onChange={(event) => setSearch(event.target.value)} />
      </div>

      <div className="content-grid">
        <div className="panel">
          <div className="panel-header">
            <h3>Course list</h3>
            <span className="pill">{filteredCourses.length} results</span>
          </div>
          <div className="stacked-list">
            {filteredCourses.map((course) => (
              <div key={course.id} className="student-card">
                <div className="student-card-main">
                  <div className="user-avatar">{course.code.slice(0, 2)}</div>
                  <div>
                    <strong>{course.code} · {course.title}</strong>
                    <p className="panel-subtitle">{course.semester} · {course.lecturers} lecturers assigned</p>
                  </div>
                </div>
                <span className="pill">{course.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Planning summary</h3>
            <span className="pill">Operations</span>
          </div>
          <ul className="timeline-list">
            <li className="timeline-item"><strong>Registration window</strong><span>Open for current semester</span><small>Ready</small></li>
            <li className="timeline-item"><strong>Prerequisites</strong><span>Checks configured for core courses</span><small>Active</small></li>
            <li className="timeline-item"><strong>Assignments</strong><span>Lecturer mapping is balanced</span><small>Stable</small></li>
          </ul>
        </div>
      </div>
    </section>
  )
}
