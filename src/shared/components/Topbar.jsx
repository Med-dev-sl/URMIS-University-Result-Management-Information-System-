export default function Topbar({ activeView, onRefresh }) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Academic overview</p>
        <h2>{activeView}</h2>
      </div>

      <button className="primary-button" type="button" onClick={onRefresh}>
        Refresh
      </button>
    </header>
  )
}
