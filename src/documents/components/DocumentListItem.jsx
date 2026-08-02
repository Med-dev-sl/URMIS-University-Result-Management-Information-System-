export default function DocumentListItem({ document, selected, onSelect }) {
  return (
    <button type="button" className={`student-card ${selected ? 'selected' : ''}`} onClick={onSelect}>
      <div className="student-card-main">
        <div className="user-avatar">{document.name.slice(0, 2).toUpperCase()}</div>
        <div>
          <strong>{document.name}</strong>
          <div className="panel-subtitle">{document.category} · v{document.version}</div>
        </div>
      </div>
      <div className="pill-list">
        <span className="pill">{document.status}</span>
        <span className="pill muted">{document.size}</span>
      </div>
    </button>
  )
}
