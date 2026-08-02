export default function ResultEditorPanel({ selectedResult, onChange, onModerate, onPublish, onLock, onReset, selectedGrade }) {
  if (!selectedResult) return null

  return (
    <div className="panel">
      <h4>Result editor</h4>
      <div className="student-tools">
        <div className="form-grid">
          <label className="field-group">
            <span className="stat-label">Student</span>
            <input className="field-input" value={selectedResult.student} onChange={(event) => onChange('student', event.target.value)} />
          </label>
          <label className="field-group">
            <span className="stat-label">Course</span>
            <input className="field-input" value={selectedResult.course} onChange={(event) => onChange('course', event.target.value)} />
          </label>
          <label className="field-group">
            <span className="stat-label">Marks</span>
            <input type="number" className="field-input" value={selectedResult.mark} onChange={(event) => onChange('mark', Number(event.target.value))} />
          </label>
          <label className="field-group">
            <span className="stat-label">Exam type</span>
            <select className="field-input" value={selectedResult.examType} onChange={(event) => onChange('examType', event.target.value)}>
              <option value="Final">Final</option>
              <option value="Special Exam">Special Exam</option>
              <option value="Resit">Resit</option>
            </select>
          </label>
        </div>
        <div className="student-tools-row">
          <span className="pill">Grade {selectedGrade.grade}</span>
          <span className="pill">Points {selectedGrade.points.toFixed(1)}</span>
          <span className="pill">Version {selectedResult.version}</span>
        </div>
        <div className="student-tools-row">
          <button type="button" className="primary-button" onClick={onModerate}>Moderate</button>
          <button type="button" className="secondary-button" onClick={onPublish}>Publish</button>
          <button type="button" className="secondary-button" onClick={onLock}>Lock</button>
          <button type="button" className="secondary-button" onClick={onReset}>Reset</button>
        </div>
      </div>
    </div>
  )
}
