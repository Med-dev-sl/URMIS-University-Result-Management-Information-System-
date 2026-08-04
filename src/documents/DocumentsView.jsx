import { useEffect, useMemo, useState } from 'react'
import DocumentListItem from './components/DocumentListItem.jsx'
import DocumentUploadCard from './components/DocumentUploadCard.jsx'
import { fetchDocuments, uploadDocument } from '../shared/api.js'

const categories = ['All', 'Course outlines', 'Past papers', 'Policies', 'Transcripts', 'Certificates', 'Calendar']
const sortOptions = ['Newest', 'Name', 'Status']

export default function DocumentsView() {
  const [documents, setDocuments] = useState([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [sortOption, setSortOption] = useState('Newest')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const loadDocuments = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await fetchDocuments()
        const normalized = Array.isArray(data) ? data : []
        setDocuments(normalized)
        if (normalized.length > 0) {
          setSelectedId(normalized[0].id)
        }
      } catch (err) {
        setError(err.message || 'Unable to load documents.')
      } finally {
        setLoading(false)
      }
    }

    loadDocuments()
  }, [])

  const filteredDocuments = useMemo(() => {
    const filtered = documents.filter((document) => {
      const matchesCategory = activeCategory === 'All' || document.category === activeCategory
      const searchable = `${document.title ?? document.name ?? ''} ${document.category ?? ''} ${document.description ?? document.summary ?? ''}`.toLowerCase()
      const matchesSearch = searchable.includes(searchTerm.toLowerCase())
      return matchesCategory && matchesSearch
    })

    return filtered.sort((left, right) => {
      if (sortOption === 'Name') {
        return (left.title ?? left.name ?? '').localeCompare(right.title ?? right.name ?? '')
      }
      if (sortOption === 'Status') {
        return (left.status ?? '').localeCompare(right.status ?? '')
      }
      return (right.id ?? 0) - (left.id ?? 0)
    })
  }, [activeCategory, documents, searchTerm, sortOption])

  const selectedDocument = filteredDocuments.find((document) => document.id === selectedId) || filteredDocuments[0] || documents[0]

  const getFriendlySize = (size) => {
    if (typeof size === 'number') {
      return `${(size / (1024 * 1024)).toFixed(1)} MB`
    }
    return String(size || 'Unknown')
  }

  const handleUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')
    setMessage('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const uploaded = await uploadDocument(formData)
      setDocuments((previous) => [uploaded, ...previous])
      setSelectedId(uploaded.id)
      setMessage('Document uploaded successfully.')
    } catch (err) {
      setError(err.message || 'Upload failed.')
    } finally {
      setUploading(false)
    }
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

      {loading ? (
        <div className="panel">
          <p>Loading documents...</p>
        </div>
      ) : error ? (
        <div className="panel auth-message error">
          <p>{error}</p>
        </div>
      ) : (
        <div className="content-grid">
          <div className="panel">
            <div className="panel-header">
              <h3>Document library</h3>
              <span className="pill">{filteredDocuments.length} results</span>
            </div>
            {filteredDocuments.length > 0 ? (
              <div className="stacked-list">
                {filteredDocuments.map((document) => (
                  <DocumentListItem key={document.id} document={{
                    id: document.id,
                    name: document.title ?? document.fileName ?? 'Untitled document',
                    category: document.category ?? document.department ?? 'General',
                    version: document.version ?? '1.0',
                    status: document.status ?? 'Unknown',
                    size: getFriendlySize(document.size),
                    owner: document.uploadedBy?.full_name ?? document.uploadedBy ?? 'Unknown',
                    updated: document.updated_at ? new Date(document.updated_at).toLocaleString() : 'Unknown',
                    summary: document.description ?? '',
                  }} selected={selectedDocument?.id === document.id} onSelect={() => setSelectedId(document.id)} />
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
                  <h4>{selectedDocument.title ?? selectedDocument.fileName ?? 'Untitled document'}</h4>
                  <p className="panel-subtitle">{selectedDocument.description ?? selectedDocument.summary ?? 'No description available.'}</p>
                  <div className="pill-list">
                    <span className="pill">{selectedDocument.category ?? selectedDocument.department ?? 'General'}</span>
                    <span className="pill muted">v{selectedDocument.version ?? '1.0'}</span>
                    <span className="pill muted">{getFriendlySize(selectedDocument.size)}</span>
                  </div>
                </div>
                <div className="student-grid">
                  <div className="panel">
                    <h4>Owner</h4>
                    <p className="panel-subtitle">{selectedDocument.uploadedBy?.full_name ?? selectedDocument.uploadedBy ?? 'Unknown'}</p>
                  </div>
                  <div className="panel">
                    <h4>Last updated</h4>
                    <p className="panel-subtitle">{selectedDocument.updated_at ? new Date(selectedDocument.updated_at).toLocaleString() : 'Unknown'}</p>
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
      )}

      {message ? <div className="auth-message success">{message}</div> : null}
      {uploading ? <div className="panel"><p>Uploading document...</p></div> : null}
      <DocumentUploadCard onUpload={handleUpload} />
    </section>
  )
}
