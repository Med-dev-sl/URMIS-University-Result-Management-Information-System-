export default function DashboardView({ dashboard, onViewChange }) {
  return (
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
            <button type="button" className="link-button" onClick={() => onViewChange('Students')}>
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
            <button type="button" className="link-button" onClick={() => onViewChange('Results')}>
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
  )
}
