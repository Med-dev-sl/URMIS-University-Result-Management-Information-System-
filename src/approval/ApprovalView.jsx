import { useMemo, useState } from 'react'
import ApprovalDecisionPanel from './components/ApprovalDecisionPanel.jsx'
import ApprovalQueueItem from './components/ApprovalQueueItem.jsx'
import { buildTimeline, getNextStage, summarizeApprovalQueue } from './approvalWorkflowUtils.js'

const initialQueue = [
  {
    id: 1,
    student: 'Amina Hassan',
    course: 'Artificial Intelligence',
    code: 'CSC401',
    currentStage: 'Lecturer',
    status: 'Pending',
    submittedAt: '2026-08-01',
    updatedAt: '2026-08-02',
    comment: '',
  },
  {
    id: 2,
    student: 'Kwame Boateng',
    course: 'Software Engineering',
    code: 'CSC403',
    currentStage: 'Head of Department',
    status: 'Pending',
    submittedAt: '2026-08-01',
    updatedAt: '2026-08-02',
    comment: 'Needs faculty review',
  },
  {
    id: 3,
    student: 'Lydia Mensah',
    course: 'Distributed Systems',
    code: 'CSC405',
    currentStage: 'Dean',
    status: 'Approved',
    submittedAt: '2026-08-01',
    updatedAt: '2026-08-02',
    comment: 'Approved by dean',
  },
  {
    id: 4,
    student: 'Daniel Asare',
    course: 'Operations Research',
    code: 'MTH401',
    currentStage: 'Examination Officer',
    status: 'Returned',
    submittedAt: '2026-08-01',
    updatedAt: '2026-08-02',
    comment: 'Missing signature',
  },
]

export default function ApprovalView() {
  const [queue, setQueue] = useState(initialQueue)
  const [selectedItemId, setSelectedItemId] = useState(initialQueue[0].id)
  const [comment, setComment] = useState('')
  const [selectedAction, setSelectedAction] = useState('Approve')
  const [search, setSearch] = useState('')

  const summary = useMemo(() => summarizeApprovalQueue(queue), [queue])
  const selectedItem = queue.find((item) => item.id === selectedItemId) || queue[0]
  const timeline = useMemo(() => buildTimeline(selectedItem), [selectedItem])

  const filteredQueue = queue.filter((item) => {
    const query = search.toLowerCase()
    return query === '' || [item.student, item.course, item.code, item.currentStage, item.status].join(' ').toLowerCase().includes(query)
  })

  const handleDecision = (action) => {
    setQueue((current) => current.map((item) => {
      if (item.id !== selectedItemId) return item

      if (action === 'Approve') {
        return {
          ...item,
          status: 'Approved',
          currentStage: getNextStage(item.currentStage),
          comment,
          updatedAt: '2026-08-02',
        }
      }

      if (action === 'Reject') {
        return {
          ...item,
          status: 'Rejected',
          currentStage: 'Rejected',
          comment,
          updatedAt: '2026-08-02',
        }
      }

      return {
        ...item,
        status: 'Returned',
        currentStage: 'Lecturer',
        comment,
        updatedAt: '2026-08-02',
      }
    }))
    setSelectedAction(action)
  }

  return (
    <section className="student-module-panel">
      <div className="student-hero">
        <div>
          <p className="eyebrow">Approval workflow</p>
          <h2>Result approval queue</h2>
          <p className="panel-subtitle">
            Route each result through lecturer, head of department, dean, examination officer, and publishing stages with clear comments and history.
          </p>
        </div>
        <div className="student-hero-badge">
          <strong>{summary.pending}</strong>
          <span>Pending items</span>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-meta"><span className="stat-label">Pending</span></div>
          <div className="stat-value">{summary.pending}</div>
          <p className="panel-subtitle">Awaiting review</p>
        </div>
        <div className="stat-card">
          <div className="stat-meta"><span className="stat-label">Approved</span></div>
          <div className="stat-value">{summary.approved}</div>
          <p className="panel-subtitle">Passed current gate</p>
        </div>
        <div className="stat-card">
          <div className="stat-meta"><span className="stat-label">Rejected</span></div>
          <div className="stat-value">{summary.rejected}</div>
          <p className="panel-subtitle">Needs reopen</p>
        </div>
        <div className="stat-card">
          <div className="stat-meta"><span className="stat-label">Returned</span></div>
          <div className="stat-value">{summary.returned}</div>
          <p className="panel-subtitle">Sent back to lecturer</p>
        </div>
      </div>

      <div className="content-grid">
        <div className="panel">
          <div className="panel-header">
            <h3>Approval queue</h3>
            <span className="pill">Responsive table</span>
          </div>
          <div className="student-tools">
            <input
              className="field-input"
              placeholder="Search student, course, stage, status"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <div className="stacked-list">
              {filteredQueue.map((item) => (
                <ApprovalQueueItem key={item.id} item={item} selected={item.id === selectedItemId} onSelect={() => setSelectedItemId(item.id)} />
              ))}
            </div>
          </div>
        </div>

        <ApprovalDecisionPanel
          selectedItem={selectedItem}
          onAction={handleDecision}
          onCommentChange={setComment}
          comment={comment}
          selectedAction={selectedAction}
        />
      </div>

      <div className="content-grid">
        <div className="panel">
          <div className="panel-header">
            <h3>Timeline</h3>
            <span className="pill">Live update</span>
          </div>
          <ul className="timeline-list">
            {timeline.map((entry) => (
              <li key={entry.id} className="timeline-item">
                <strong>{entry.title}</strong>
                <span>{entry.detail}</span>
                <small>{entry.date}</small>
              </li>
            ))}
          </ul>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Approval history</h3>
            <span className="pill">Notifications</span>
          </div>
          <ul className="timeline-list">
            {queue.filter((item) => item.id === selectedItemId).map((item) => (
              <li key={item.id} className="timeline-item">
                <strong>{item.student}</strong>
                <span>{item.comment || 'No comments yet'}</span>
                <small>{item.currentStage} · {item.status}</small>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
