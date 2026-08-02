export default function DeanModuleCard({ title, subtitle, value, accent }) {
  return (
    <div className="panel" style={{ background: accent || '#fff' }}>
      <div className="stat-meta">
        <span className="stat-label">{title}</span>
      </div>
      <div className="stat-value">{value}</div>
      <p className="panel-subtitle">{subtitle}</p>
    </div>
  )
}
