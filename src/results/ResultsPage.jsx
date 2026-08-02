import { useMemo, useState } from 'react'
import ResultEditorPanel from './components/ResultEditorPanel.jsx'
import ResultMetricCard from './components/ResultMetricCard.jsx'
import { calculateCgpa, calculateGpa, calculateGrade, detectCarryOvers, summarizeResultStats } from './resultModuleUtils.js'

const initialResults = [
  { id: 1, student: 'Amina Hassan', course: 'Artificial Intelligence', code: 'CSC401', mark: 82, grade: 'A', credits: 3, status: 'Published', term: '2024/2025 Sem 1', examType: 'Final', moderate: false, version: 'v1' },
  { id: 2, student: 'Kwame Boateng', course: 'Software Engineering', code: 'CSC403', mark: 68, grade: 'C', credits: 3, status: 'Pending', term: '2024/2025 Sem 1', examType: 'Resit', moderate: false, version: 'v2' },
  { id: 3, student: 'Lydia Mensah', course: 'Distributed Systems', code: 'CSC405', mark: 47, grade: 'F', credits: 3, status: 'Carry Over', term: '2024/2025 Sem 1', examType: 'Special Exam', moderate: true, version: 'v1' },
  { id: 4, student: 'Daniel Asare', course: 'Operations Research', code: 'MTH401', mark: 74, grade: 'B', credits: 2, status: 'Locked', term: '2024/2025 Sem 1', examType: 'Final', moderate: true, version: 'v3' },
]

const semesterSummaries = [
  { semester: '2024/2025 Sem 1', credits: 11, points: 40 },
  { semester: '2023/2024 Sem 2', credits: 8, points: 24 },
]

export default function ResultsPage() {
  const [results, setResults] = useState(initialResults)
  const [search, setSearch] = useState('')
  const [selectedResultId, setSelectedResultId] = useState(initialResults[0].id)
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [view, setView] = useState('entry')

  const selectedResult = results.find((item) => item.id === selectedResultId) || results[0]

  const stats = useMemo(() => summarizeResultStats(results), [results])
  const gpa = useMemo(() => calculateGpa(results.map((item) => ({ credits: item.credits, mark: item.mark }))), [results])
  const cgpa = useMemo(() => calculateCgpa(semesterSummaries), [])
  const carryOvers = useMemo(() => detectCarryOvers(results), [results])

  const filteredResults = useMemo(() => {
    return results.filter((item) => {
      const query = search.toLowerCase()
      const matchesQuery = query === '' || [item.student, item.course, item.code, item.status].join(' ').toLowerCase().includes(query)
      const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus
      return matchesQuery && matchesStatus
    })
  }, [results, search, selectedStatus])

  const handleGradeUpdate = (field, value) => {
    setResults((current) => current.map((item) => item.id === selectedResultId ? { ...item, [field]: value } : item))
  }

  const handleSave = () => {
    setResults((current) => current.map((item) => item.id === selectedResultId ? { ...item, status: 'Moderated', version: `${item.version}+1` } : item))
  }

  const handlePublish = () => {
    setResults((current) => current.map((item) => item.id === selectedResultId ? { ...item, status: 'Published' } : item))
  }

  const handleLock = () => {
    setResults((current) => current.map((item) => item.id === selectedResultId ? { ...item, status: 'Locked' } : item))
  }

  const handleReset = () => {
    setResults((current) => current.map((item) => item.id === selectedResultId ? { ...item, status: 'Pending', version: item.version.replace(/\+\d+$/, '') } : item))
  }

  const selectedGrade = calculateGrade(selectedResult?.mark || 0)

  return (
    <section className="student-module-panel">
      <div className="student-hero">
        <div>
          <p className="eyebrow">Result management</p>
          <h2>University result operations center</h2>
          <p className="panel-subtitle">Enter results, handle approvals, calculate GPA/CGPA, detect carryovers, moderate decisions, publish outcomes, and export reports.</p>
        </div>
        <div className="student-hero-badge">
          <strong>{selectedGrade.grade}</strong>
          <span>Current selection</span>
        </div>
      </div>

      <div className="stats-grid">
        <ResultMetricCard label="GPA" value={gpa.gpa.toFixed(2)} detail={`Current load ${gpa.totalCredits} credits`} />
        <ResultMetricCard label="CGPA" value={cgpa.cgpa.toFixed(2)} detail={`Across ${cgpa.totalCredits} credits`} />
        <ResultMetricCard label="Carry Over" value={carryOvers.length} detail="Needs remediation" />
        <ResultMetricCard label="Published" value={stats.published} detail="Real-time release count" />
      </div>

      <div className="student-section-nav">
        <button type="button" className={`tab-item ${view === 'entry' ? 'active' : ''}`} onClick={() => setView('entry')}>Result entry</button>
        <button type="button" className={`tab-item ${view === 'history' ? 'active' : ''}`} onClick={() => setView('history')}>Result history</button>
        <button type="button" className={`tab-item ${view === 'reports' ? 'active' : ''}`} onClick={() => setView('reports')}>Statistics & charts</button>
      </div>

      <div className="content-grid">
        <div className="panel">
          <div className="panel-header">
            <h3>{view === 'entry' ? 'Result entry & editing' : view === 'history' ? 'Result history' : 'Statistics & charts'}</h3>
            <div className="student-tools-row">
              <button type="button" className="secondary-button">Export PDF</button>
              <button type="button" className="secondary-button">Export Excel</button>
              <button type="button" className="secondary-button">Print</button>
            </div>
          </div>

          {view === 'entry' && (
            <div className="student-tools">
              <div className="student-tools-row">
                <label className="field-group" style={{ flex: 1 }}>
                  <span className="stat-label">Search</span>
                  <input className="field-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search student, course, status" />
                </label>
                <label className="field-group">
                  <span className="stat-label">Status</span>
                  <select className="field-input" value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)}>
                    <option value="All">All</option>
                    <option value="Published">Published</option>
                    <option value="Pending">Pending</option>
                    <option value="Moderated">Moderated</option>
                    <option value="Locked">Locked</option>
                    <option value="Carry Over">Carry Over</option>
                  </select>
                </label>
              </div>

              <div className="student-grid">
                <div className="panel">
                  <h4>Result list</h4>
                  <div className="results-list">
                    {filteredResults.map((item) => (
                      <button key={item.id} type="button" className="result-item" onClick={() => setSelectedResultId(item.id)} style={{ textAlign: 'left', background: 'transparent', border: 'none', padding: '14px 0' }}>
                        <div>
                          <strong>{item.student}</strong>
                          <span>{item.course} · {item.code}</span>
                        </div>
                        <div className="result-score">
                          <span>{item.mark}</span>
                          <small>{item.status}</small>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <ResultEditorPanel
                  selectedResult={selectedResult}
                  onChange={handleGradeUpdate}
                  onModerate={handleSave}
                  onPublish={handlePublish}
                  onLock={handleLock}
                  onReset={handleReset}
                  selectedGrade={selectedGrade}
                />
              </div>
            </div>
          )}

          {view === 'history' && (
            <div className="table-card">
              <table className="data-table">
                <thead>
                  <tr><th>Student</th><th>Course</th><th>Mark</th><th>Grade</th><th>Status</th><th>Version</th></tr>
                </thead>
                <tbody>
                  {results.map((item) => (
                    <tr key={item.id}><td>{item.student}</td><td>{item.course}</td><td>{item.mark}</td><td>{item.grade}</td><td>{item.status}</td><td>{item.version}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {view === 'reports' && (
            <div className="student-grid">
              <div className="panel">
                <h4>Statistics</h4>
                <ul className="timeline-list">
                  <li className="timeline-item"><strong>Published</strong><span>{stats.published} results</span></li>
                  <li className="timeline-item"><strong>Pending</strong><span>{stats.pending} results</span></li>
                  <li className="timeline-item"><strong>Moderated</strong><span>{stats.moderated} results</span></li>
                  <li className="timeline-item"><strong>Locked</strong><span>{stats.locked} results</span></li>
                </ul>
              </div>
              <div className="panel">
                <h4>Charts</h4>
                <div className="sparkline">
                  {results.map((item) => (
                    <div key={item.id} className="sparkbar" style={{ height: `${Math.max(24, item.mark)}px` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
