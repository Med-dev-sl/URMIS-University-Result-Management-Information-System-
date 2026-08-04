import { useEffect, useMemo, useState } from 'react'
import ExaminationActionPanel from './components/ExaminationActionPanel.jsx'
import ExaminationQueueItem from './components/ExaminationQueueItem.jsx'
import { summarizeExaminationMetrics } from './examinationModuleUtils.js'
import { fetchTranscriptRequests } from '../shared/api.js'

const initialItems = [
  {
    id: 1,
    student: 'Amina Yeboah',
    course: 'Computer Science',
    code: 'CSC401',
    type: 'Transcript',
    status: 'Pending review',
    dueDate: '2026-08-03',
    owner: 'Examination Officer',
    note: 'Transcript request awaiting verification of final grades.',
    category: 'Graduation',
  },
  {
    id: 2,
    student: 'Kwame Boateng',
    course: 'Software Engineering',
    code: 'CSC403',
    type: 'Certificate',
    status: 'Published',
    dueDate: '2026-08-04',
    owner: 'Registrar Desk',
    note: 'Certificate package prepared for release.',
    category: 'Graduation',
  },
  {
    id: 3,
    student: 'Lydia Mensah',
    course: 'Business Administration',
    code: 'BUS221',
    type: 'Correction',
    status: 'Needs attention',
    dueDate: '2026-08-02',
    owner: 'Academic Records',
    note: 'Final grade correction request requires faculty approval.',
    category: 'Regular',
  },
]

export default function ExaminationView() {
  const [items, setItems] = useState(initialItems)
  const [selectedItemId, setSelectedItemId] = useState(initialItems[0].id)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadRequests = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await fetchTranscriptRequests()
        if (Array.isArray(data) && data.length > 0) {
          const normalized = data.map((request) => ({
            id: request.id,
            student: request.student_name || 'Unknown student',
            course: request.purpose || 'Transcript request',
            code: String(request.student_id ?? ''),
            type: request.purpose?.toLowerCase().includes('transcript') ? 'Transcript' : request.purpose?.toLowerCase().includes('certificate') ? 'Certificate' : request.purpose?.toLowerCase().includes('correction') ? 'Correction' : 'Request',
            status: request.status ? String(request.status).replace(/\b(\w)/g, (match) => match.toUpperCase()) : 'Pending review',
            dueDate: request.updated_at ? new Date(request.updated_at).toLocaleDateString() : 'Unknown',
            owner: request.requested_by_name || 'Office',
            note: request.purpose || request.status || '',
            category: request.purpose?.includes('Graduation') ? 'Graduation' : 'Regular',
          }))
          setItems(normalized)
          setSelectedItemId(normalized[0].id)
        }
      } catch (err) {
        setError(err.message || 'Unable to load examination requests.')
      } finally {
        setLoading(false)
      }
    }

    loadRequests()
  }, [])

  const metrics = useMemo(() => summarizeExaminationMetrics(items), [items])
  const selectedItem = items.find((item) => item.id === selectedItemId) || items[0]

  const filteredItems = items.filter((item) => {
    const query = search.toLowerCase()
    return query === '' || [item.student, item.course, item.code, item.type, item.status].join(' ').toLowerCase().includes(query)
  })

  if (loading) {
    return (
      <section className="student-module-panel">
        <div className="panel">
          <p>Loading examination items...</p>
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
          <p className="eyebrow">Examination Office</p>
          <h2>Academic records and certification workload</h2>
          <p className="panel-subtitle">Track transcript requests, certificates, correction cases, and graduation readiness from one responsive workspace.</p>
        </div>
        <div className="student-hero-badge">
          <strong>{items.length}</strong>
          <span>Open items</span>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-meta"><span className="stat-label">Pending results</span></div>
          <div className="stat-value">{metrics.pendingResults}</div>
          <p className="panel-subtitle">Awaiting review</p>
        </div>
        <div className="stat-card">
          <div className="stat-meta"><span className="stat-label">Published results</span></div>
          <div className="stat-value">{metrics.publishedResults}</div>
          <p className="panel-subtitle">Released to students</p>
        </div>
        <div className="stat-card">
          <div className="stat-meta"><span className="stat-label">Graduation candidates</span></div>
          <div className="stat-value">{metrics.graduationCandidates}</div>
          <p className="panel-subtitle">Ready for clearance</p>
        </div>
        <div className="stat-card">
          <div className="stat-meta"><span className="stat-label">Correction requests</span></div>
          <div className="stat-value">{metrics.correctionRequests}</div>
          <p className="panel-subtitle">Needs follow-up</p>
        </div>
      </div>

      <div className="content-grid">
        <div className="panel">
          <div className="panel-header">
            <h3>Examination queue</h3>
            <span className="pill">Responsive workflow</span>
          </div>
          <div className="student-tools">
            <input className="field-input" placeholder="Search student, course, type, status" value={search} onChange={(event) => setSearch(event.target.value)} />
            <div className="stacked-list">
              {filteredItems.map((item) => (
                <ExaminationQueueItem key={item.id} item={item} selected={item.id === selectedItemId} onSelect={() => setSelectedItemId(item.id)} />
              ))}
            </div>
          </div>
        </div>

        <ExaminationActionPanel selectedItem={selectedItem} />
      </div>

      <div className="content-grid">
        <div className="panel">
          <div className="panel-header">
            <h3>Operations overview</h3>
            <span className="pill">Reports & stats</span>
          </div>
          <div className="student-grid">
            <div className="panel">
              <h4 style={{ marginTop: 0 }}>Transcript processing</h4>
              <p className="stat-value">{metrics.transcriptProcessing}</p>
              <p className="panel-subtitle">Pending transcript packets</p>
            </div>
            <div className="panel">
              <h4 style={{ marginTop: 0 }}>Certificate processing</h4>
              <p className="stat-value">{metrics.certificateProcessing}</p>
              <p className="panel-subtitle">Certificates prepared</p>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Recent audit trail</h3>
            <span className="pill">Audit logs</span>
          </div>
          <ul className="timeline-list">
            {items.map((item) => (
              <li key={item.id} className="timeline-item">
                <strong>{item.student}</strong>
                <span>{item.note}</span>
                <small>{item.status} · {item.owner}</small>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
