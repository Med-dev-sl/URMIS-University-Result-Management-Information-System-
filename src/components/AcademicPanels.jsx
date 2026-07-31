export default function AcademicPanels({
  activeTab,
  academicForm,
  selectedFaculty,
  selectedDepartment,
  selectedCourse,
  facultyOptions,
  departmentOptions,
  courseOptions,
  onAcademicInputChange,
  onFacultyChange,
  onDepartmentChange,
  onCourseChange,
  onCreateFaculty,
  onCreateDepartment,
  onCreateCourse,
  onCreateModule,
}) {
  return (
    <section className="tab-panel">
      {activeTab === 'Faculty' && (
        <form className="result-form" onSubmit={onCreateFaculty}>
          <label>
            Faculty name
            <input
              type="text"
              name="facultyName"
              value={academicForm.facultyName}
              onChange={onAcademicInputChange}
              placeholder="e.g. Science & Technology"
              required
            />
          </label>
          <button type="submit" className="primary-button">
            Add faculty
          </button>
        </form>
      )}

      {activeTab === 'Department' && (
        <form className="result-form" onSubmit={onCreateDepartment}>
          <label>
            Parent faculty
            <select value={selectedFaculty} onChange={onFacultyChange} required>
              <option value="">Select a faculty</option>
              {facultyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Department name
            <input
              type="text"
              name="departmentName"
              value={academicForm.departmentName}
              onChange={onAcademicInputChange}
              placeholder="e.g. Computer Science"
              required
            />
          </label>
          <button type="submit" className="primary-button" disabled={!selectedFaculty}>
            Add department
          </button>
        </form>
      )}

      {activeTab === 'Course' && (
        <form className="result-form" onSubmit={onCreateCourse}>
          <label>
            Parent department
            <select value={selectedDepartment} onChange={onDepartmentChange} required>
              <option value="">Select a department</option>
              {departmentOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Course code
            <input
              type="text"
              name="courseCode"
              value={academicForm.courseCode}
              onChange={onAcademicInputChange}
              placeholder="e.g. CSC401"
              required
            />
          </label>
          <label>
            Course name
            <input
              type="text"
              name="courseName"
              value={academicForm.courseName}
              onChange={onAcademicInputChange}
              placeholder="e.g. Software Engineering"
              required
            />
          </label>
          <label>
            Credit hours
            <input
              type="number"
              name="courseCreditHours"
              value={academicForm.courseCreditHours}
              min="1"
              onChange={onAcademicInputChange}
            />
          </label>
          <button type="submit" className="primary-button" disabled={!selectedDepartment}>
            Add course
          </button>
        </form>
      )}

      {activeTab === 'Module' && (
        <form className="result-form" onSubmit={onCreateModule}>
          <label>
            Parent course
            <select value={selectedCourse} onChange={onCourseChange} required>
              <option value="">Select a course</option>
              {courseOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Module code
            <input
              type="text"
              name="moduleCode"
              value={academicForm.moduleCode}
              onChange={onAcademicInputChange}
              placeholder="e.g. CSC401-1"
              required
            />
          </label>
          <label>
            Module name
            <input
              type="text"
              name="moduleName"
              value={academicForm.moduleName}
              onChange={onAcademicInputChange}
              placeholder="e.g. Requirements Engineering"
              required
            />
          </label>
          <label>
            Credit hours
            <input
              type="number"
              name="moduleCreditHours"
              value={academicForm.moduleCreditHours}
              min="1"
              onChange={onAcademicInputChange}
            />
          </label>
          <label>
            Description
            <input
              type="text"
              name="moduleDescription"
              value={academicForm.moduleDescription}
              onChange={onAcademicInputChange}
              placeholder="Short module overview"
            />
          </label>
          <button type="submit" className="primary-button" disabled={!selectedCourse}>
            Add module
          </button>
        </form>
      )}
    </section>
  )
}
