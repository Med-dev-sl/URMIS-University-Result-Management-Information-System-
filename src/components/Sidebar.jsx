export default function Sidebar({ views, activeView, onSelectView }) {
  return (
    <aside className="sidebar">
      <div className="brand-block">
        <div className="brand-mark">U</div>
        <div>
          <p className="eyebrow">Platform</p>
          <h1>URMIS</h1>
        </div>
      </div>

      <nav className="nav" aria-label="Main navigation">
        {views.map((view) => (
          <button
            key={view}
            className={`nav-item ${view === activeView ? 'active' : ''}`}
            type="button"
            onClick={() => onSelectView(view)}
          >
            {view}
          </button>
        ))}
      </nav>
    </aside>
  )
}
