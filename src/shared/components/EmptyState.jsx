export default function EmptyState({
  title = 'Nothing here yet',
  description = 'No records are available at the moment.',
  actionLabel,
  onAction,
}) {
  return (
    <div className="state-card state-card-muted" role="status">
      <div className="state-icon">📭</div>
      <div>
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
      {actionLabel && onAction ? (
        <button type="button" className="primary-button" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}
