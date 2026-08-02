export default function ReportFilterBar({ activeSection, onChangeSection, dateRange, onDateRangeChange }) {
  const sections = ['students', 'courses', 'departments', 'faculties', 'results', 'graduation', 'carryOver', 'probation', 'performance', 'teachingLoad', 'auditLogs']

  return (
    <div className="panel">
      <div className="panel-header">
        <h3>Report filters</h3>
        <span className="pill">Date range</span>
      </div>
      <div className="student-tools">
        <div className="student-tools-row">
          {sections.map((section) => (
            <button key={section} type="button" className={`tab-item ${activeSection === section ? 'active' : ''}`} onClick={() => onChangeSection(section)}>
              {section.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase())}
            </button>
          ))}
        </div>
        <div className="student-grid">
          <label className="stat-label">
            Start date
            <input className="field-input" type="date" value={dateRange.start} onChange={(event) => onDateRangeChange({ ...dateRange, start: event.target.value })} />
          </label>
          <label className="stat-label">
            End date
            <input className="field-input" type="date" value={dateRange.end} onChange={(event) => onDateRangeChange({ ...dateRange, end: event.target.value })} />
          </label>
        </div>
      </div>
    </div>
  )
}
