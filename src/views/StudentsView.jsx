export default function StudentsView({ students }) {
  return (
    <article className="panel full-width-panel">
      <div className="panel-header">
        <h3>All students</h3>
      </div>

      <ul className="student-list">
        {students.map((student) => (
          <li key={student.id} className="student-item">
            <div>
              <strong>{student.full_name}</strong>
              <span>
                {student.student_id} · {student.department_name} · {student.enrollment_year}
              </span>
            </div>
            <span className="student-badge">{student.semester}</span>
          </li>
        ))}
      </ul>
    </article>
  )
}
