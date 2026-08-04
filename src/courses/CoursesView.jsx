import { useEffect, useMemo, useState } from 'react'
import { fetchCourses } from '../shared/api.js'

export default function CoursesView() {
  const [courses, setCourses] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await fetchCourses()
        setCourses(Array.isArray(data) ? data : [])
      } catch (err) {
        setError(err.message || 'Unable to load courses.')
      } finally {
        setLoading(false)
      }
    }

    loadCourses()
  }, [])

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const searchable = `${course.course_code ?? course.code ?? ''} ${course.course_name ?? course.title ?? ''} ${course.status ?? ''}`.toLowerCase()
      return searchable.includes(search.toLowerCase())
    })
  }, [courses, search])

  return (
    <section className="student-module-panel">
      <div className="student-hero">
        <div>
          <p className="eyebrow">Courses module</p>
          <h2>Course catalogue and planning workspace</h2>
          <p className="panel-subtitle">Review available courses, assignments, and registration readiness in one place.</p>
        </div>
        <div className="student-hero-badge">
          <strong>{courses.length}</strong>
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

      {loading ? (
        <div className="panel">
          <p>Loading courses...</p>
        </div>
      ) : error ? (
        <div className="panel auth-message error">
          <p>{error}</p>
        </div>
      ) : (
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
                    <div className="user-avatar">{(course.course_code ?? course.code ?? '??').slice(0, 2).toUpperCase()}</div>
                    <div>
                      <strong>{course.course_code ?? course.code} · {course.course_name ?? course.title}</strong>
                      <p className="panel-subtitle">
                        {course.department_name || course.department || 'Department unavailable'} · {course.credit_hours ?? course.creditUnits ?? 0} credit units
                      </p>
                    </div>
                  </div>
                  <span className="pill">{course.status ?? 'Active'}</span>
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
      )}
    </section>
  )
}
