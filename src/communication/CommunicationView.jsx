import { useMemo, useState } from 'react'
import { filterCommunicationItems } from './communicationUtils.js'

const communicationData = [
  { id: 1, title: 'Semester registration opens', detail: 'All students should confirm schedules by Friday.', category: 'Announcements', audience: 'Students', priority: 'High' },
  { id: 2, title: 'Faculty meeting', detail: 'Heads of departments to confirm course allocations.', category: 'Announcements', audience: 'Staff', priority: 'Medium' },
  { id: 3, title: 'Result publication reminder', detail: 'Lecturers should clear pending approvals before publication.', category: 'Announcements', audience: 'Lecturers', priority: 'High' },
  { id: 4, sender: 'Registry', subject: 'Transcript request update', detail: 'Transcript request is ready for dispatch.', category: 'Inbox', time: '09:10' },
  { id: 5, sender: 'Examination Office', subject: 'Certificate issuance checklist', detail: 'Checklist for graduation documents.', category: 'Inbox', time: '08:35' },
  { id: 6, sender: 'Platform Admin', subject: 'Security notice', detail: 'Review changes to access policies.', category: 'Inbox', time: 'Yesterday' },
  { id: 7, title: 'Email template: Welcome email', detail: 'Template for student onboarding.', category: 'Email Templates', audience: 'Students', priority: 'Medium' },
  { id: 8, title: 'SMS template: Attendance alert', detail: 'Reminder for attendance shortage.', category: 'SMS Templates', audience: 'Parents', priority: 'High' },
  { id: 9, title: 'Broadcast: Fee reminder', detail: 'Scheduled for all active students.', category: 'Broadcast Messages', audience: 'Students', priority: 'High' },
  { id: 10, title: 'Draft: Semester policy notice', detail: 'Pending review before release.', category: 'Drafts', audience: 'All', priority: 'Low' },
]

const categories = ['All', 'Announcements', 'Inbox', 'Email Templates', 'SMS Templates', 'Broadcast Messages', 'Drafts']
const channelTabs = ['Notifications', 'Announcements', 'Messages', 'Email Templates', 'SMS Templates', 'Broadcast Messages', 'Inbox', 'Sent Items', 'Drafts']

export default function CommunicationView() {
  const [activeChannel, setActiveChannel] = useState('Notifications')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const filteredItems = useMemo(() => filterCommunicationItems(communicationData, searchTerm, selectedCategory), [searchTerm, selectedCategory])

  const metrics = useMemo(() => ({
    announcements: communicationData.filter((item) => item.category === 'Announcements').length,
    inbox: communicationData.filter((item) => item.category === 'Inbox').length,
    templates: communicationData.filter((item) => item.category === 'Email Templates' || item.category === 'SMS Templates').length,
    drafts: communicationData.filter((item) => item.category === 'Drafts').length,
  }), [])

  const visibleItems = useMemo(() => {
    if (activeChannel === 'Notifications') {
      return filteredItems.filter((item) => item.category === 'Announcements' || item.category === 'Inbox')
    }
    if (activeChannel === 'Messages') {
      return filteredItems.filter((item) => item.category === 'Inbox' || item.category === 'Drafts')
    }
    if (activeChannel === 'Sent Items') {
      return filteredItems.filter((item) => item.category === 'Broadcast Messages' || item.category === 'Announcements')
    }
    if (activeChannel === 'Email Templates' || activeChannel === 'SMS Templates') {
      return filteredItems.filter((item) => item.category === activeChannel)
    }
    return filteredItems.filter((item) => item.category === activeChannel)
  }, [activeChannel, filteredItems])

  return (
    <section className="student-module-panel">
      <div className="student-hero">
        <div>
          <p className="eyebrow">Communication module</p>
          <h2>Institution communication hub</h2>
          <p className="panel-subtitle">Manage notifications, announcements, messages, templates, inbox items, drafts, and broadcasts from one responsive workspace.</p>
        </div>
        <div className="student-hero-badge">
          <strong>{communicationData.length}</strong>
          <span>Communication items</span>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Announcements</div>
          <div className="stat-value">{metrics.announcements}</div>
          <div className="stat-meta"><span className="stat-trend">Live</span><span className="stat-label">published</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Inbox</div>
          <div className="stat-value">{metrics.inbox}</div>
          <div className="stat-meta"><span className="stat-trend">New</span><span className="stat-label">messages</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Templates</div>
          <div className="stat-value">{metrics.templates}</div>
          <div className="stat-meta"><span className="stat-trend">Ready</span><span className="stat-label">email & SMS</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Drafts</div>
          <div className="stat-value">{metrics.drafts}</div>
          <div className="stat-meta"><span className="stat-trend">Pending</span><span className="stat-label">review</span></div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3>Search and filters</h3>
          <span className="pill">Responsive</span>
        </div>
        <div className="student-tools">
          <label className="field-group">
            <span className="stat-label">Search communications</span>
            <input className="field-input" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search by title, detail, or subject" />
          </label>
          <div className="student-tools-row">
            {categories.map((category) => (
              <button key={category} type="button" className={`secondary-button ${selectedCategory === category ? 'primary-button' : ''}`} onClick={() => setSelectedCategory(category)}>{category}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="student-section-nav">
        {channelTabs.map((channel) => (
          <button key={channel} type="button" className={`secondary-button ${activeChannel === channel ? 'primary-button' : ''}`} onClick={() => setActiveChannel(channel)}>{channel}</button>
        ))}
      </div>

      <div className="content-grid">
        <div className="panel">
          <div className="panel-header">
            <h3>{activeChannel}</h3>
            <span className="pill">{visibleItems.length} items</span>
          </div>
          {visibleItems.length > 0 ? (
            <div className="stacked-list">
              {visibleItems.map((item) => (
                <div key={item.id} className="student-card">
                  <div className="student-card-main">
                    <div className="user-avatar">{(item.title || item.subject || item.category).slice(0, 2).toUpperCase()}</div>
                    <div>
                      <strong>{item.title || item.subject}</strong>
                      <p className="panel-subtitle">{item.detail || `From ${item.sender}`}</p>
                    </div>
                  </div>
                  <div className="pill-list">
                    <span className="pill">{item.category}</span>
                    <span className="pill muted">{item.priority || item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="panel-subtitle">No items match the current search and filter selection.</p>
          )}
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Quick composer</h3>
            <span className="pill">Broadcast</span>
          </div>
          <div className="student-tools">
            <label className="field-group">
              <span className="stat-label">Message</span>
              <textarea className="field-input" rows={4} placeholder="Compose a notification, email, or SMS" />
            </label>
            <label className="field-group">
              <span className="stat-label">Audience</span>
              <input className="field-input" placeholder="Students, staff, parents, faculty" />
            </label>
            <div className="student-tools-row">
              <button className="primary-button" type="button">Send</button>
              <button className="secondary-button" type="button">Schedule</button>
              <button className="secondary-button" type="button">Save draft</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
