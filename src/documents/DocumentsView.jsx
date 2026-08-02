import { useMemo, useState } from 'react'
import DocumentListItem from './components/DocumentListItem.jsx'
import DocumentUploadCard from './components/DocumentUploadCard.jsx'

const initialDocuments = [
  {
    id: 1,
    name: 'CSC401 Course Outline.pdf',
    category: 'Course outlines',
    version: '3.1',
    status: 'Approved',
    size: '1.4 MB',
    owner: 'Department of Computing',
    updated: 'Today, 09:10',
    summary: 'Semester plan, weekly breakdown, and assessment schedule for the current offering.',
  },
  {
    id: 2,
    name: '2025 Past Paper - Semester 1.pdf',
    category: 'Past papers',
    version: '2.0',
    status: 'Published',
    size: '860 KB',
    owner: 'Examination Office',
    updated: 'Yesterday',
    summary: 'Official past paper for the first semester examination series.',
  },
  {
    id: 3,
    name: 'Student Handbook 2026.pdf',
    category: 'Policies',
    version: '1.4',
    status: 'Reviewed',
    size: '2.1 MB',
    owner: 'Registry',
    updated: '2 days ago',
    summary: 'Latest student handbook with registration, grading, and appeals guidance.',
  },
]

const categories = ['All', 'Course outlines', 'Past papers', 'Policies', 'Transcripts', 'Certificates', 'Calendar']
const sortOptions = ['Newest', 'Name', 'Status']

export default function DocumentsView() {
  const [documents, setDocuments] = useState(initialDocuments)
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedId, setSelectedId] = useState(initialDocuments[0].id)
  const [sortOption, setSortOption] = useState('Newest')

  const filteredDocuments = useMemo(() => {
    const filtered = documents.filter((document) => {
      const matchesCategory = activeCategory === 'All' || document.category === activeCategory
      const matchesSearch = `${document.name} ${document.category} ${document.summary}`.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesCategory && matchesSearch
    })

    return filtered.sort((left, right) => {
      if (sortOption === 'Name') {
        return left.name.localeCompare(right.name)
      }
      if (sortOption === 'Status') {
        return left.status.localeCompare(right.status)
      }
      return right.id - left.id
    })
  }, [activeCategory, documents, searchTerm, sortOption])

  const selectedDocument = filteredDocuments.find((document) => document.id === selectedId) || filteredDocuments[0] || documents[0]

  const handleUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const newDocument = {
      id: Date.now(),
      name: file.name,
      category: 'Policies',
      version: '1.0',
      status: 'Queued',
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      owner: 'You',
      updated: 'Just now',
      summary: 'Newly uploaded document awaiting review and approval.',
    }

    setDocuments((previous) => [newDocument, ...previous])
    setSelectedId(newDocument.id)
  }

  return (
    <section className="student-module-panel">
      <div className="student-hero">
        <div>
          <p className="eyebrow">Documents module</p>
          <h2>Document and records workspace</h2>
          <p className="panel-subtitle">Manage academic files, policies, transcripts, certificates, and archive-ready materials from one responsive workspace.</p>
        </div>
        <div className="student-hero-badge">
          <strong>{documents.length}</strong>
          <span>Tracked documents</span>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Approved</div>
          <div className="stat-value">{documents.filter((document) => document.status === 'Approved').length}</div>
          <div className="stat-meta"><span className="stat-trend">Live</span><span className="stat-label">ready for access</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Published</div>
          <div className="stat-value">{documents.filter((document) => document.status === 'Published').length}</div>
          <div className="stat-meta"><span className="stat-trend">Visible</span><span className="stat-label">student-facing</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Reviewed</div>
          <div className="stat-value">{documents.filter((document) => document.status === 'Reviewed').length}</div>
          <div className="stat-meta"><span className="stat-trend">Clear</span><span className="stat-label">policy-ready</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Queued</div>
          <div className="stat-value">{documents.filter((document) => document.status === 'Queued').length}</div>
          <div className="stat-meta"><span className="stat-trend">Pending</span><span className="stat-label">review</span></div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3>Find and organize documents</h3>
          <span className="pill">Search + filter</span>
        </div>
        <div className="student-tools">
          <label className="field-group">
            <span className="stat-label">Search documents</span>
            <input className="field-input" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search by name, category, or summary" />
          </label>
          <div className="student-tools-row">
            {categories.map((category) => (
              <button key={category} type="button" className={`secondary-button ${activeCategory === category ? 'primary-button' : ''}`} onClick={() => setActiveCategory(category)}>
                {category}
              </button>
            ))}
          </div>
          <div className="student-tools-row">
            {sortOptions.map((option) => (
              <button key={option} type="button" className={`secondary-button ${sortOption === option ? 'primary-button' : ''}`} onClick={() => setSortOption(option)}>
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="content-grid">
        <div className="panel">
          <div className="panel-header">
            <h3>Document library</h3>
            <span className="pill">{filteredDocuments.length} results</span>
          </div>
          {filteredDocuments.length > 0 ? (
            <div className="stacked-list">
              {filteredDocuments.map((document) => (
                <DocumentListItem key={document.id} document={document} selected={selectedDocument?.id === document.id} onSelect={() => setSelectedId(document.id)} />
              ))}
            </div>
          ) : (
            <div className="panel">
              <h4>No documents found</h4>
              <p className="panel-subtitle">Try another category or search term to locate a document.</p>
            </div>
          )}
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Document preview</h3>
            <span className="pill">{selectedDocument?.status}</span>
          </div>
          {selectedDocument ? (
            <div className="student-tools">
              <div className="panel">
                <h4>{selectedDocument.name}</h4>
                <p className="panel-subtitle">{selectedDocument.summary}</p>
                <div className="pill-list">
                  <span className="pill">{selectedDocument.category}</span>
                  <span className="pill muted">v{selectedDocument.version}</span>
                  <span className="pill muted">{selectedDocument.size}</span>
                </div>
              </div>
              <div className="student-grid">
                <div className="panel">
                  <h4>Owner</h4>
                  <p className="panel-subtitle">{selectedDocument.owner}</p>
                </div>
                <div className="panel">
                  <h4>Last updated</h4>
                  <p className="panel-subtitle">{selectedDocument.updated}</p>
                </div>
              </div>
              <div className="student-tools-row">
                <button className="primary-button" type="button">Download</button>
                <button className="secondary-button" type="button">Share</button>
                <button className="secondary-button" type="button">Version history</button>
              </div>
            </div>
          ) : (
            <p className="panel-subtitle">Select a document to preview it here.</p>
          )}
        </div>
      </div>

      <DocumentUploadCard onUpload={handleUpload} />
    </section>
  )
}
