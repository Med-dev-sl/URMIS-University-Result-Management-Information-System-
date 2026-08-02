export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <section className="auth-shell" aria-label="Authentication shell">
      <div className="auth-card">
        <div className="auth-hero">
          <div className="brand-mark auth-brand">U</div>
          <div>
            <p className="eyebrow">URMIS</p>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
        </div>
        {children}
        {footer ? <div className="auth-footer">{footer}</div> : null}
      </div>
    </section>
  )
}
