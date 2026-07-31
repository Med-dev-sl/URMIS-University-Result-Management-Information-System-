export default function ResultForm({ studentOptions, courseOptions, formState, onInputChange, onSubmit }) {
  return (
    <article className="panel full-width-panel">
      <div className="panel-header">
        <h3>Enter a new result</h3>
      </div>

      <form className="result-form" onSubmit={onSubmit}>
        <label>
          Student
          <select name="student_id" value={formState.student_id} onChange={onInputChange} required>
            <option value="">Select a student</option>
            {studentOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Course
          <select name="course_id" value={formState.course_id} onChange={onInputChange} required>
            <option value="">Select a course</option>
            {courseOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="form-row">
          <label>
            Assignment score
            <input
              type="number"
              name="assignment_score"
              value={formState.assignment_score}
              onChange={onInputChange}
              required
            />
          </label>
          <label>
            Exam score
            <input type="number" name="exam_score" value={formState.exam_score} onChange={onInputChange} required />
          </label>
        </div>

        <label>
          Academic session
          <input
            name="academic_session"
            value={formState.academic_session}
            onChange={onInputChange}
            placeholder="2024/2025"
            required
          />
        </label>

        <button type="submit" className="primary-button">
          Save result
        </button>
      </form>
    </article>
  )
}
