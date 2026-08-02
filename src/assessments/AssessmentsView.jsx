import { useMemo, useState } from 'react'

const assessmentItems = [
  { id: 1, title: 'Mid-semester test', course: 'CSC401', status: 'Ready', weight: '20%' },
  { id: 2, title: 'Practical lab', course: 'BUS221', status: 'In review', weight: '15%' },
  { id: 3, title: 'Project proposal', course: 'ENG301', status: 'Draft', weight: '10%' },
]

export default function AssessmentsView() {
  const [search, setSearch] = useState('')

  const filteredItems = useMemo(() => {
    return assessmentItems.filter((item) => `${item.title} ${item.course} ${item.status}`.toLowerCase().includes(search.toLowerCase()))
  }, [search])

  return (
    <section className="student-module-panel">
      <div className="student-hero">
        <div>
          <p className="eyebrow">Assessments module</p>
          <h2>Assessment coordination dashboard</h2>
          <p className="panel-subtitle">Track assessment instruments, weights, and review status across courses.</p>
        </div>
        <div className="student-hero-badge">
          <strong>{assessmentItems.length}</strong>
          <span>Active assessments</span>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3>Assessment search</h3>
          <span className="pill">Find records</span>
        </div>
        <input className="field-input" placeholder="Search assessments" value={search} onChange={(event) => setSearch(event.target.value)} />
      </div>

      <div className="content-grid">
        <div className="panel">
          <div className="panel-header">
            <h3>Assessment queue</h3>
            <span className="pill">{filteredItems.length} results</span>
          </div>
          <div className="stacked-list">
            {filteredItems.map((item) => (
              <div key={item.id} className="student-card">
                <div className="student-card-main">
                  <div className="user-avatar">{item.course.slice(0, 2)}</div>
                  <div>
                    <strong>{item.title}</strong>
                    <p className="panel-subtitle">{item.course} · Weight {item.weight}</p>
                  </div>
                </div>
                <span className="pill">{item.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Summary</h3>
            <span className="pill">Overview</span>
          </div>
          <ul className="timeline-list">
            <li className="timeline-item"><strong>Ready</strong><span>Assessments prepared for release</span><small>1</small></li>
            <li className="timeline-item"><strong>In review</strong><span>Waiting on moderation</span><small>1</small></li>
            <li className="timeline-item"><strong>Draft</strong><span>Needs further detail</span><small>1</small></li>
          </ul>
        </div>
      </div>
    </section>
  )
}
