export default function Sidebar({ viewGroups, activeRoute, onSelectRoute }) {
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
            {group.items.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${item.route === activeRoute ? 'active' : ''}`}
                type="button"
                onClick={() => onSelectRoute(item.route)}
              >
                {item.icon ? <span className="nav-icon">{item.icon}</span> : null}
                {item.title}
              </button>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  )
}
