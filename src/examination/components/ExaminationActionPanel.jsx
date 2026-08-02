export default function ExaminationActionPanel({ selectedItem }) {
  if (!selectedItem) return null

  return (
    <div className="panel">
      <div className="panel-header">
        <h3>Selected request</h3>
        <span className="pill">{selectedItem.type}</span>
      </div>

      <div className="student-tools">
        <div className="student-card">
          <div className="student-card-main">
            <div className="user-avatar large">{selectedItem.student.split(' ').map((word) => word[0]).join('').slice(0, 2)}</div>
            <div>
              <strong>{selectedItem.student}</strong>
              <div className="panel-subtitle">{selectedItem.course} · {selectedItem.code}</div>
            </div>
          </div>
        </div>

        <div className="student-tools-row">
          <button className="primary-button">Publish results</button>
          <button className="secondary-button">Generate transcript</button>
          <button className="secondary-button">Flag correction</button>
        </div>

        <div className="panel">
          <h4 style={{ marginTop: 0 }}>Workflow details</h4>
          <p className="panel-subtitle">{selectedItem.note}</p>
          <div className="pill-list">
            <span className="pill">Due: {selectedItem.dueDate}</span>
            <span className="pill muted">Owner: {selectedItem.owner}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
