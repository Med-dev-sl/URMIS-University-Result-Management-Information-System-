export default function ReportChartCard({ title, subtitle, value }) {
  return (
    <div className="panel">
      <div className="stat-meta">
        <span className="stat-label">{title}</span>
      </div>
      <div className="stat-value">{value}</div>
      <p className="panel-subtitle">{subtitle}</p>
    </div>
  )
}
