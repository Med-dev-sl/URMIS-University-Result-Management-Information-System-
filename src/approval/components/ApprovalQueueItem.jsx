export default function ApprovalQueueItem({ item, selected, onSelect }) {
  return (
    <button type="button" className={`result-item ${selected ? 'selected-card' : ''}`} onClick={() => onSelect(item)} style={{ textAlign: 'left', background: 'transparent', border: 'none', padding: '14px 0' }}>
      <div>
        <strong>{item.student}</strong>
        <span>{item.course} · {item.code}</span>
      </div>
      <div className="result-score">
        <span>{item.currentStage}</span>
        <small>{item.status}</small>
      </div>
    </button>
  )
}
