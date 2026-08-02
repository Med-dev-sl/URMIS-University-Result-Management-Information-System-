export default function ApprovalDecisionPanel({ selectedItem, onAction, onCommentChange, comment, selectedAction }) {
  if (!selectedItem) return null

  return (
    <div className="panel">
      <h4>Decision panel</h4>
      <div className="student-tools">
        <div className="student-tools-row">
          <button type="button" className={`primary-button ${selectedAction === 'Approve' ? 'selected-card' : ''}`} onClick={() => onAction('Approve')}>Approve</button>
          <button type="button" className={`secondary-button ${selectedAction === 'Reject' ? 'selected-card' : ''}`} onClick={() => onAction('Reject')}>Reject</button>
          <button type="button" className={`secondary-button ${selectedAction === 'Return' ? 'selected-card' : ''}`} onClick={() => onAction('Return')}>Return</button>
        </div>
        <label className="field-group">
          <span className="stat-label">Comments</span>
          <textarea className="field-input" rows={4} value={comment} onChange={(event) => onCommentChange(event.target.value)} placeholder="Add reviewer comments" />
        </label>
        <div className="student-tools-row">
          <span className="pill">Current stage: {selectedItem.currentStage}</span>
          <span className="pill">Status: {selectedItem.status}</span>
        </div>
      </div>
    </div>
  )
}
