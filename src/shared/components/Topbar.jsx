export default function Topbar({ activeView, user, onRefresh, onSignOut }) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Academic overview</p>
        <h2>{activeView}</h2>
      </div>

      <div className="topbar-actions">
        {user ? <span className="topbar-user">{user.full_name || user.email}</span> : null}
        <button className="primary-button" type="button" onClick={onRefresh}>
          Refresh
        </button>
        {user ? (
          <button className="secondary-button" type="button" onClick={onSignOut}>
            Sign out
          </button>
        ) : null}
      </div>
    </header>
  )
}
