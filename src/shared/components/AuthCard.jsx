export default function AuthCard({ title, subtitle, children, icon }) {
  return (
    <div className="auth-card" role="presentation">
      <div className="auth-hero">
        {icon ? <div className="auth-brand">{icon}</div> : null}
        <div>
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
      </div>
      {children}
    </div>
  )
}
