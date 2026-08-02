import { useMemo, useState } from 'react'
import { summarizeLeadershipOverview } from '../shared/utils/leadershipModuleUtils.js'
import HodModuleCard from './components/HodModuleCard.jsx'

const initialItems = [
  { id: 1, title: 'Course allocation review', status: 'Pending', owner: 'Programmes Office' },
  { id: 2, title: 'Department result approval', status: 'In review', owner: 'Lecturer' },
  { id: 3, title: 'Assigned lecturer update', status: 'Ready', owner: 'HoD office' },
]

export default function HodView() {
  const [items] = useState(initialItems)
  const [activeTab, setActiveTab] = useState('dashboard')
  const summary = useMemo(() => summarizeLeadershipOverview(items), [items])

  return (
    <section className="student-module-panel">
      <div className="student-hero">
        <div>
          <p className="eyebrow">Head of Department</p>
          <h2>Department leadership workspace</h2>
          <p className="panel-subtitle">Coordinate course allocations, lecturer assignments, department results, and approvals.</p>
        </div>
        <div className="student-hero-badge">
          <strong>{summary.totalOpenItems}</strong>
          <span>Department items</span>
        </div>
      </div>

      <div className="student-section-nav">
        {['dashboard', 'allocation', 'lecturers', 'results', 'approvals', 'reports'].map((tab) => (
          <button key={tab} type="button" className={`tab-item ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab === 'dashboard' ? 'Department Dashboard' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="stats-grid">
        <HodModuleCard title="Department results" subtitle="Awaiting review" value="12" />
        <HodModuleCard title="Approvals" subtitle="Pending sign-off" value={summary.pendingApprovals} />
        <HodModuleCard title="Assigned lecturers" subtitle="Active teaching staff" value="8" />
        <HodModuleCard title="Reports" subtitle="Weekly summary" value="3" />
      </div>

      {activeTab === 'dashboard' && (
        <div className="content-grid">
          <div className="panel">
            <div className="panel-header"><h3>Department dashboard</h3><span className="pill">Operations</span></div>
            <div className="student-grid">
              <div className="panel">
                <h4>Course allocation</h4>
                <p className="panel-subtitle">Current semester allocations are balanced across core and elective courses.</p>
              </div>
              <div className="panel">
                <h4>Department statistics</h4>
                <p className="panel-subtitle">Average module completion stands at 91% with low escalation volume.</p>
              </div>
            </div>
          </div>
          <div className="panel">
            <div className="panel-header"><h3>Open department items</h3><span className="pill">Queue</span></div>
            <ul className="timeline-list">
              {items.map((item) => (
                <li key={item.id} className="timeline-item">
                  <strong>{item.title}</strong>
                  <span>{item.owner}</span>
                  <small>{item.status}</small>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'allocation' && (
        <div className="panel">
          <div className="panel-header"><h3>Course allocation</h3><span className="pill">Semester planning</span></div>
          <div className="student-grid">
            <div className="panel"><h4>CSC401</h4><p className="panel-subtitle">Assigned to Dr. Mensah</p></div>
            <div className="panel"><h4>CSC403</h4><p className="panel-subtitle">Assigned to Dr. Boadu</p></div>
          </div>
        </div>
      )}

      {activeTab === 'lecturers' && (
        <div className="panel">
          <div className="panel-header"><h3>Assigned lecturers</h3><span className="pill">Staff list</span></div>
          <div className="table-card">
            <table className="data-table">
              <thead><tr><th>Lecturer</th><th>Course</th><th>Status</th></tr></thead>
              <tbody>
                <tr><td>Dr. Mensah</td><td>CSC401</td><td>Active</td></tr>
                <tr><td>Dr. Boadu</td><td>CSC403</td><td>Active</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'results' && (
        <div className="panel">
          <div className="panel-header"><h3>Department results</h3><span className="pill">Review</span></div>
          <p className="panel-subtitle">Department-level results are monitored for consistency, moderation, and final approval readiness.</p>
        </div>
      )}

      {activeTab === 'approvals' && (
        <div className="panel">
          <div className="panel-header"><h3>Approvals</h3><span className="pill">Sign-offs</span></div>
          <ul className="timeline-list">
            {items.map((item) => (
              <li key={item.id} className="timeline-item"><strong>{item.title}</strong><span>{item.owner}</span><small>{item.status}</small></li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="student-grid">
          <div className="panel"><h4>Statistics</h4><p className="panel-subtitle">Attendance and pass-rate trends remain stable across the department.</p></div>
          <div className="panel"><h4>Reports</h4><p className="panel-subtitle">Monthly and semester summaries can be exported to PDF or spreadsheet.</p></div>
        </div>
      )}
    </section>
  )
}
