export default function AcademicsOverview({
  selectedFaculty,
  selectedDepartment,
  selectedCourse,
  facultyOptions,
  departmentOptions,
  courseOptions,
  onFacultyChange,
  onDepartmentChange,
  onCourseChange,
  moduleList,
}) {
  return (
    <article className="panel full-width-panel">
      <div className="panel-header">
        <h3>Academic structure</h3>
      </div>

      <div className="result-form">
        <label>
          Faculty
          <select name="faculty" value={selectedFaculty} onChange={onFacultyChange}>
            <option value="">Select a faculty</option>
            {facultyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Department
          <select name="department" value={selectedDepartment} onChange={onDepartmentChange} disabled={!selectedFaculty}>
            <option value="">Select a department</option>
            {departmentOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Course
          <select name="course" value={selectedCourse} onChange={onCourseChange} disabled={!selectedDepartment}>
            <option value="">Select a course</option>
            {courseOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="panel-header" style={{ marginTop: '24px' }}>
        <h3>Course modules</h3>
      </div>

      <ul className="student-list">
        {moduleList.map((module) => (
          <li key={module.id} className="student-item">
            <div>
              <strong>{module.module_name}</strong>
              <span>
                {module.module_code} · {module.department_name}
              </span>
            </div>
            <span className="student-badge">{module.credit_hours} CH</span>
          </li>
        ))}
      </ul>
    </article>
  )
}
