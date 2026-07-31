import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { createResult, fetchCourses, fetchDashboard, fetchResults, fetchStudents } from './api'

const emptyDashboard = {
  stats: [],
  students: [],
  recentResults: [],
}

const views = ['Dashboard', 'Students', 'Results']

function App() {
  const [activeView, setActiveView] = useState('Dashboard')
  const [dashboard, setDashboard] = useState(emptyDashboard)
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [formState, setFormState] = useState({ student_id: '', course_id: '', assignment_score: '', exam_score: '', academic_session: '' })

  const isDashboard = activeView === 'Dashboard'
  const isStudents = activeView === 'Students'
  const isResults = activeView === 'Results'

  const loadDashboard = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchDashboard()
      setDashboard(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadStudents = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchStudents()
      setStudents(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadResults = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchResults()
      setResults(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadCourses = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchCourses()
      setCourses(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const boot = async () => {
      await loadDashboard()
    }

    boot()
  }, [])

  useEffect(() => {
    const loadViewData = async () => {
      if (isStudents) await loadStudents()
      if (isResults) {
        await loadResults()
        await loadCourses()
      }
    }

    loadViewData()
  }, [activeView, isResults, isStudents])

  const studentOptions = useMemo(
    () => students.map((student) => ({ value: student.id, label: `${student.full_name} (${student.student_id})` })),
    [students],
  )

  const courseOptions = useMemo(
    () => courses.map((course) => ({ value: course.id, label: `${course.course_code} — ${course.course_name}` })),
    [courses],
  )

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setFormState((current) => ({ ...current, [name]: value }))
  }

  const handleResultSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      await createResult({
        student_id: Number(formState.student_id),
        course_id: Number(formState.course_id),
        assignment_score: Number(formState.assignment_score),
        exam_score: Number(formState.exam_score),
        academic_session: formState.academic_session,
      })

      setSuccessMessage('Result saved successfully.')
      setFormState({ student_id: '', course_id: '', assignment_score: '', exam_score: '', academic_session: '' })
      loadResults()
      loadDashboard()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="dashboard-shell" aria-label="URMIS dashboard">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">U</div>
          <div>
            <p className="eyebrow">Platform</p>
            <h1>URMIS</h1>
          </div>
        </div>

        <nav className="nav" aria-label="Main navigation">
          {views.map((view) => (
            <button
              key={view}
              className={`nav-item ${view === activeView ? 'active' : ''}`}
              type="button"
              onClick={() => {
                setActiveView(view)
                setError('')
                setSuccessMessage('')
              }}
            >
              {view}
            </button>
          ))}
        </nav>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">Academic overview</p>
            <h2>{activeView}</h2>
          </div>

          <button
            className="primary-button"
            type="button"
            onClick={() => {
              if (isDashboard) loadDashboard()
              if (isStudents) loadStudents()
              if (isResults) loadResults()
            }}
          >
            Refresh
          </button>
        </header>

        {error ? (
          <div className="alert" role="alert">
            {error}
          </div>
        ) : null}

        {successMessage ? (
          <div className="success" role="status">
            {successMessage}
          </div>
        ) : null}

        {loading ? (
          <div className="loading-card">Loading...</div>
        ) : isDashboard ? (
          <>
            <section className="stats-grid" aria-label="Key metrics">
              {dashboard.stats.map((stat) => (
                <article key={stat.label} className="stat-card">
                  <div className="stat-meta">
                    <span className="stat-label">{stat.label}</span>
                    <span className="stat-trend">{stat.trend}</span>
                  </div>
                  <strong className="stat-value">{stat.value}</strong>
                </article>
              ))}
            </section>

            <section className="content-grid">
              <article className="panel">
                <div className="panel-header">
                  <h3>Students</h3>
                  <button type="button" className="link-button" onClick={() => setActiveView('Students')}>
                    View all
                  </button>
                </div>

                <ul className="student-list">
                  {dashboard.students.map((student) => (
                    <li key={student.id} className="student-item">
                      <div>
                        <strong>{student.full_name}</strong>
                        <span>
                          {student.student_id} · {student.department_name}
                        </span>
                      </div>
                      <span className="student-badge">{student.semester}</span>
                    </li>
                  ))}
                </ul>
              </article>

              <article className="panel">
                <div className="panel-header">
                  <h3>Recent results</h3>
                  <button type="button" className="link-button" onClick={() => setActiveView('Results')}>
                    View all
                  </button>
                </div>

                <ul className="results-list">
                  {dashboard.recentResults.map((result) => (
                    <li key={result.id} className="result-item">
                      <div>
                        <strong>{result.student_name}</strong>
                        <span>{result.course_name}</span>
                      </div>
                      <div className="result-score">
                        <span>{result.grade}</span>
                        <small>{result.percentage}%</small>
                      </div>
                    </li>
                  ))}
                </ul>
              </article>
            </section>
          </>
        ) : isStudents ? (
          <article className="panel full-width-panel">
            <div className="panel-header">
              <h3>All students</h3>
            </div>

            <ul className="student-list">
              {students.map((student) => (
                <li key={student.id} className="student-item">
                  <div>
                    <strong>{student.full_name}</strong>
                    <span>
                      {student.student_id} · {student.department_name} · {student.enrollment_year}
                    </span>
                  </div>
                  <span className="student-badge">{student.semester}</span>
                </li>
              ))}
            </ul>
          </article>
        ) : (
          <article className="panel full-width-panel">
            <div className="panel-header">
              <h3>Enter a new result</h3>
            </div>

            <form className="result-form" onSubmit={handleResultSubmit}>
              <label>
                Student
                <select name="student_id" value={formState.student_id} onChange={handleInputChange} required>
                  <option value="">Select a student</option>
                  {studentOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Course
                <select name="course_id" value={formState.course_id} onChange={handleInputChange} required>
                  <option value="">Select a course</option>
                  {courseOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="form-row">
                <label>
                  Assignment score
                  <input
                    type="number"
                    name="assignment_score"
                    value={formState.assignment_score}
                    onChange={handleInputChange}
                    required
                  />
                </label>
                <label>
                  Exam score
                  <input type="number" name="exam_score" value={formState.exam_score} onChange={handleInputChange} required />
                </label>
              </div>

              <label>
                Academic session
                <input
                  name="academic_session"
                  value={formState.academic_session}
                  onChange={handleInputChange}
                  placeholder="2024/2025"
                  required
                />
              </label>

              <button type="submit" className="primary-button">
                Save result
              </button>
            </form>

            <div className="panel-header" style={{ marginTop: '28px' }}>
              <h3>Recent results</h3>
            </div>

            <ul className="results-list">
              {results.map((result) => (
                <li key={result.id} className="result-item">
                  <div>
                    <strong>{result.student_name}</strong>
                    <span>{result.course_name}</span>
                  </div>
                  <div className="result-score">
                    <span>{result.grade}</span>
                    <small>{result.percentage}%</small>
                  </div>
                </li>
              ))}
            </ul>
          </article>
        )}
      </section>
    </main>
  )
}

export default App
