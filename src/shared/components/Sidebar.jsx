export default function Sidebar({ viewGroups, activeView, onSelectView }) {
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
        {viewGroups.map((group) => (
          <div key={group.label} className="nav-group">
            <p className="nav-group-label">{group.label}</p>
            {group.items.map((view) => (
              <button
                key={view}
                className={`nav-item ${view === activeView ? 'active' : ''}`}
                type="button"
                onClick={() => onSelectView(view)}
              >
                {view}
              </button>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  )
}
