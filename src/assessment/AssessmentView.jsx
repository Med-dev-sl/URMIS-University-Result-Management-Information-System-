import { useEffect, useMemo, useState } from 'react'
import { buildScorePreview, getAssessmentTypeOptions, summarizeAssessments } from './assessmentModuleUtils.js'
import { fetchAssessments } from '../shared/api.js'

const initialAssessments = [
  { id: 1, title: 'Programming Assignment 1', type: 'Assignment', weight: 10, score: 88, status: 'Approved', date: '2026-07-18' },
  { id: 2, title: 'Midterm Quiz', type: 'Quiz', weight: 15, score: 72, status: 'Draft', date: '2026-07-20' },
  { id: 3, title: 'Practical Lab Test', type: 'Practical', weight: 20, score: 65, status: 'Pending', date: '2026-07-25' },
  { id: 4, title: 'Final Exam Review', type: 'Final Examination', weight: 30, score: 81, status: 'Approved', date: '2026-07-29' },
]

function AssessmentForm({ formState, onChange, onSubmit }) {
  return (
    <div className="panel">
      <h4>Assessment template</h4>
      <div className="form-grid">
        <label className="field-group">
          <span className="stat-label">Title</span>
          <input className="field-input" value={formState.title} onChange={(event) => onChange('title', event.target.value)} />
        </label>
        <label className="field-group">
          <span className="stat-label">Type</span>
          <select className="field-input" value={formState.type} onChange={(event) => onChange('type', event.target.value)}>
            {getAssessmentTypeOptions().map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>
        <label className="field-group">
          <span className="stat-label">Weight</span>
          <input type="number" className="field-input" value={formState.weight} onChange={(event) => onChange('weight', Number(event.target.value))} />
        </label>
        <label className="field-group">
          <span className="stat-label">Score</span>
          <input type="number" className="field-input" value={formState.score} onChange={(event) => onChange('score', Number(event.target.value))} />
        </label>
      </div>
      <div className="student-tools-row" style={{ marginTop: '12px' }}>
        <button type="button" className="primary-button" onClick={onSubmit}>Save assessment</button>
        <button type="button" className="secondary-button">Save draft</button>
        <button type="button" className="secondary-button">Bulk upload</button>
      </div>
    </div>
  )
}

export default function AssessmentView() {
  const [assessments, setAssessments] = useState(initialAssessments)
  const [search, setSearch] = useState('')
  const [formState, setFormState] = useState({ title: 'New assessment', type: 'Assignment', weight: 10, score: 75 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadAssessments = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await fetchAssessments()
        if (Array.isArray(data)) {
          setAssessments(data.map((item) => ({
            id: item.id,
            title: item.title || 'Untitled assessment',
            type: item.type || 'Assignment',
            weight: item.weights?.reduce((sum, weightItem) => sum + Number(weightItem.weight || 0), 0) || item.weight || 0,
            score: item.scores?.[0]?.finalMark ?? item.score ?? 0,
            status: item.status ? String(item.status).replace(/\b(\w)/g, (match) => match.toUpperCase()) : 'Draft',
            date: item.created_at ? item.created_at.slice(0, 10) : item.date,
          })))
        }
      } catch (err) {
        setError(err.message || 'Unable to load assessments.')
      } finally {
        setLoading(false)
      }
    }

    loadAssessments()
  }, [])

  const summary = useMemo(() => summarizeAssessments(assessments), [assessments])
  const previewRows = useMemo(() => buildScorePreview(assessments), [assessments])

  const filteredItems = assessments.filter((item) => {
    const query = search.toLowerCase()
    return query === '' || [item.title, item.type, item.status].join(' ').toLowerCase().includes(query)
  })

  const handleChange = (field, value) => {
    setFormState((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = () => {
    setAssessments((current) => [
      {
        id: Date.now(),
        title: formState.title,
        type: formState.type,
        weight: formState.weight,
        score: formState.score,
        status: 'Draft',
        date: new Date().toISOString().slice(0, 10),
      },
      ...current,
    ])
  }

  if (loading) {
    return (
      <section className="student-module-panel">
        <div className="panel">
          <p>Loading assessments...</p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="student-module-panel">
        <div className="panel auth-message error">
          <p>{error}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="student-module-panel">
      <div className="student-hero">
        <div>
          <p className="eyebrow">Assessment module</p>
          <h2>Assessment workspace</h2>
          <p className="panel-subtitle">Create templates, configure weights, enter scores, preview grades, and review approvals.</p>
        </div>
        <div className="student-hero-badge">
          <strong>Reusable</strong>
          <span>Frontend-only assessment views</span>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-meta"><span className="stat-label">Total weight</span></div>
          <div className="stat-value">{summary.totalWeight}%</div>
          <p className="panel-subtitle">Configured for the current term</p>
        </div>
        <div className="stat-card">
          <div className="stat-meta"><span className="stat-label">Approved</span></div>
          <div className="stat-value">{summary.approved}</div>
          <p className="panel-subtitle">Ready for release</p>
        </div>
        <div className="stat-card">
          <div className="stat-meta"><span className="stat-label">Drafts</span></div>
          <div className="stat-value">{summary.draft}</div>
          <p className="panel-subtitle">Awaiting final review</p>
        </div>
        <div className="stat-card">
          <div className="stat-meta"><span className="stat-label">Preview grade</span></div>
          <div className="stat-value">{previewRows[0]?.preview || '—'}</div>
          <p className="panel-subtitle">From the latest score entry</p>
        </div>
      </div>

      <div className="content-grid">
        <div className="panel">
          <div className="panel-header">
            <h3>Assessment templates</h3>
            <button type="button" className="secondary-button">Print</button>
          </div>
          <div className="student-tools">
            <input className="field-input" placeholder="Search assessments" value={search} onChange={(event) => setSearch(event.target.value)} />
            <div className="student-grid">
              {filteredItems.map((item) => (
                <div key={item.id} className="info-card">
                  <span className="stat-label">{item.type}</span>
                  <strong>{item.title}</strong>
                  <p className="panel-subtitle">Weight {item.weight}% · Score {item.score} · {item.status}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <AssessmentForm formState={formState} onChange={handleChange} onSubmit={handleSubmit} />
      </div>

      <div className="content-grid">
        <div className="panel">
          <div className="panel-header">
            <h3>Grade preview</h3>
            <span className="pill">Validation</span>
          </div>
          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr><th>Assessment</th><th>Score</th><th>Preview</th><th>Status</th></tr>
              </thead>
              <tbody>
                {previewRows.map((row) => (
                  <tr key={row.id}><td>{row.title}</td><td>{row.score}</td><td>{row.preview}</td><td>{row.status}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Approval status</h3>
            <span className="pill">Workflow</span>
          </div>
          <ul className="timeline-list">
            <li className="timeline-item"><strong>Assignment 1</strong><span>Approved by course lead</span></li>
            <li className="timeline-item"><strong>Midterm Quiz</strong><span>Awaiting department review</span></li>
            <li className="timeline-item"><strong>Practical Lab Test</strong><span>Needs rubric confirmation</span></li>
          </ul>
        </div>
      </div>
    </section>
  )
}
