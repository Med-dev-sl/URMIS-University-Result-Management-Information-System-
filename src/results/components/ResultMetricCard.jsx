export default function ResultMetricCard({ label, value, detail }) {
  return (
    <div className="stat-card">
      <div className="stat-meta"><span className="stat-label">{label}</span></div>
      <div className="stat-value">{value}</div>
      <p className="panel-subtitle">{detail}</p>
    </div>
  )
}
