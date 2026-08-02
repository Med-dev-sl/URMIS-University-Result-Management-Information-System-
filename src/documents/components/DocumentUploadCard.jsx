export default function DocumentUploadCard({ onUpload }) {
  return (
    <div className="panel">
      <div className="panel-header">
        <h3>Upload document</h3>
        <span className="pill">Reusable upload</span>
      </div>
      <div className="student-tools">
        <label className="stat-label">
          Select file
          <input className="field-input" type="file" onChange={onUpload} />
        </label>
        <div className="student-tools-row">
          <button className="primary-button" type="button">Upload</button>
          <button className="secondary-button" type="button">Save draft</button>
        </div>
      </div>
    </div>
  )
}
