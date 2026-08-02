export default function LoadingState({
  title = 'Loading',
  description = 'Preparing your workspace...',
}) {
  return (
    <div className="state-card" role="status" aria-live="polite">
      <div className="state-icon">⏳</div>
      <div>
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
      <div className="skeleton-stack" aria-hidden="true">
        <div className="skeleton-line short" />
        <div className="skeleton-line" />
        <div className="skeleton-line" />
      </div>
    </div>
  )
}
