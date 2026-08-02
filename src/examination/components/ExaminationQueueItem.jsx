export default function ExaminationQueueItem({ item, selected, onSelect }) {
  return (
    <button type="button" className={`student-card ${selected ? 'selected' : ''}`} onClick={onSelect}>
      <div className="student-card-main">
        <div className="user-avatar">{item.student.split(' ').map((word) => word[0]).join('').slice(0, 2)}</div>
        <div>
          <strong>{item.student}</strong>
          <div className="panel-subtitle">{item.course} · {item.code}</div>
        </div>
      </div>
      <div className="pill-list">
        <span className={`pill ${item.status === 'Published' ? 'status-active' : item.status === 'Pending review' ? 'status-pending' : 'status-suspended'}`}>{item.status}</span>
        <span className="pill muted">{item.type}</span>
      </div>
    </button>
  )
}
