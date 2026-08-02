import { useMemo, useState } from 'react'
import { summarizeLeadershipOverview } from '../shared/utils/leadershipModuleUtils.js'
import DeanModuleCard from './components/DeanModuleCard.jsx'

const initialItems = [
  { id: 1, type: 'Approval', status: 'Pending', title: 'Faculty result approval', owner: 'HoD' },
  { id: 2, type: 'Approval', status: 'Approved', title: 'Faculty-level appeals', owner: 'Dean' },
  { id: 3, type: 'Graduation', status: 'Pending', title: 'Final graduation review', owner: 'Registrar' },
  { id: 4, type: 'Complaint', status: 'Escalated', title: 'Grade complaint', owner: 'Student Affairs' },
]

export default function DeanView() {
  const [items] = useState(initialItems)
  const [activeTab, setActiveTab] = useState('dashboard')
  const summary = useMemo(() => summarizeLeadershipOverview(items), [items])

  return (
    <section className="student-module-panel">
      <div className="student-hero">
        <div>
          <p className="eyebrow">Dean office</p>
          <h2>Faculty leadership workspace</h2>
          <p className="panel-subtitle">Review approvals, graduation cases, complaints, and faculty performance.</p>
        </div>
        <div className="student-hero-badge">
          <strong>{summary.totalOpenItems}</strong>
          <span>Open matters</span>
        </div>
      </div>

      <div className="student-section-nav">
        {['dashboard', 'approvals', 'graduation', 'complaints', 'reports'].map((tab) => (
          <button key={tab} type="button" className={`tab-item ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab === 'dashboard' ? 'Faculty Dashboard' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="stats-grid">
        <DeanModuleCard title="Pending approvals" subtitle="Awaiting faculty action" value={summary.pendingApprovals} />
        <DeanModuleCard title="Graduation review" subtitle="Ready for final sign-off" value={summary.graduationReviews} />
        <DeanModuleCard title="Complaints" subtitle="Escalated cases" value={summary.complaints} />
        <DeanModuleCard title="Faculty statistics" subtitle="Performance snapshot" value="94%" />
      </div>

      {activeTab === 'dashboard' && (
        <div className="content-grid">
          <div className="panel">
            <div className="panel-header"><h3>Faculty dashboard</h3><span className="pill">Live overview</span></div>
            <div className="student-grid">
              <div className="panel">
                <h4>Performance reports</h4>
                <p className="panel-subtitle">Average pass rate for the faculty is 89% with a strong graduation completion trend.</p>
              </div>
              <div className="panel">
                <h4>Approvals</h4>
                <p className="panel-subtitle">7 approvals are pending across departments and student appeals.</p>
              </div>
            </div>
          </div>
          <div className="panel">
            <div className="panel-header"><h3>Recent matters</h3><span className="pill">Queue</span></div>
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

      {activeTab === 'approvals' && (
        <div className="panel">
          <div className="panel-header"><h3>Approvals</h3><span className="pill">Faculty actions</span></div>
          <div className="table-card">
            <table className="data-table">
              <thead><tr><th>Item</th><th>Status</th><th>Owner</th></tr></thead>
              <tbody>
                {items.filter((item) => item.type === 'Approval').map((item) => (
                  <tr key={item.id}><td>{item.title}</td><td>{item.status}</td><td>{item.owner}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'graduation' && (
        <div className="panel">
          <div className="panel-header"><h3>Graduation review</h3><span className="pill">Clearance</span></div>
          <p className="panel-subtitle">Graduation candidates are reviewed for eligibility, audit compliance, and outstanding requirements.</p>
        </div>
      )}

      {activeTab === 'complaints' && (
        <div className="panel">
          <div className="panel-header"><h3>Complaints</h3><span className="pill">Escalations</span></div>
          <ul className="timeline-list">
            {items.filter((item) => item.type === 'Complaint').map((item) => (
              <li key={item.id} className="timeline-item"><strong>{item.title}</strong><span>{item.owner}</span><small>{item.status}</small></li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="student-grid">
          <div className="panel"><h4>Faculty statistics</h4><p className="panel-subtitle">Completing courses: 86% · Average graduation time: 4.1 years</p></div>
          <div className="panel"><h4>Performance reports</h4><p className="panel-subtitle">Faculty outcome quality remains above benchmark across the last three academic sessions.</p></div>
        </div>
      )}
    </section>
  )
}
